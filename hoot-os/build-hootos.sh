#!/bin/bash
#
# usage:
#
#     sudo build-hootos.sh <buildname>
#
# where <buildname> is a new build directory
#
# this script will create following subfolders in the current working directory:
# buildname/staging 
# buildname/tmpo 
# buildname/hootos
# 
# requirements:
# - the baseos must be built first with build-baseos.sh, and the baseos 
#   directory must be in the current working directory.
# - you must set the environment variable HOOT_REPO to point to the root of
#   your local hootNAS git repository
# - internet connection
# - must be run as root on a jammy distro
#
# optional environment variables:
# - HOOT_LOCALE, if not set, defaults to 'en_DE.UTF-8'
#   set your locale in the format 'en_XX.UTF-8'
#   see supported UTF-8 locales here: /usr/share/i18n/SUPPORTED
# - HOOT_XKB_LAYOUT, if not set, defaults to 'de'
#   see supported keyboard settings: /usr/share/X11/xkb/rules/evdev.lst
# - HOOT_ZONE, if not set, defaults to 'Europe'
#   setting up your local timezone and city is especially important for LDAP/AD 
#   authentication. supported timezones: /usr/share/zoneinfo
# - HOOT_CITY, if not set, defaults to 'Berlin'
#
################################################################################
#                            USER VARIABLES
################################################################################
#
# you can set all the following variables to your liking
#
# set the kernel version to be installed, we want to be in control of which 
# kernel version is installed, so we can detect any problems that may arise
# from a kernel upgrade.
kernel_version="6.2.0-26-generic"
# set the build variable to either 'metal' or 'virtual'
# build 'metal' system which includes firmware and microcode, 
# or 'virtual' system which doesn't include firmware and microcode
build=virtual
# keyboard settings, convenient if you are going to be working in the terminal. 
# model 'pc105' is a good general choice for most keyboards
# see supported keyboard settings: /usr/share/X11/xkb/rules/evdev.lst
xkb_model=pc105
# download and install node.js
nodejs_version=v18.12.0
#
################################################################################

# start measuring time
SECONDS=0

# set bash options
# -e            exit immediately if any command returns non-zero exit status
# -o pipefail   use exit status of the last command as exit status
set -e -o pipefail
# error handler, called on non-zero exit codes
function trapper {
  if [ $? -ne 0 ]; then
    echo "fatal error!"
  else
    echo
    echo "hootos created successfully!"
    echo
    echo "if required, you can now logon to hootos, review and edit its"
    echo "content by running:"
    echo "  sudo edit-hootos.sh mount $build_dir"
    echo "or you create an iso file by running:"
    echo "  sudo build-hootiso.sh $build_dir my-filename.iso"
    echo
  fi
  # lazy umount because it's mounted recusively with --rbind
  [ "$(mountpoint -q hootos/dev ; echo $?)" = 0 ] && umount -lf hootos/dev
  [ "$(mountpoint -q hootos/proc ; echo $?)" = 0 ] && umount -lf hootos/proc
  [ "$(mountpoint -q hootos/sys ; echo $?)" = 0 ] && umount -lf hootos/sys
  # if node tarball exists, delete it
  [ -f "node-${nodejs_version}-linux-x64.tar.xz" ] && \
    rm node-${nodejs_version}-linux-x64.tar.xz
  # unmount overlay filesystem
  [ "$(mountpoint -q $PWD/hootos ; echo $?)" = 0 ] && \
    umount $PWD/hootos
  # delete tmpo directory
  [ -d "tmpo" ] && rm -r tmpo
  # return to original working directory
  cd $owd
  # calculate duration
  duration=$SECONDS
  duration_min=$(($duration / 60))
  duration_sec=$(($duration % 60))
  echo "runtime $duration_min minutes and $duration_sec seconds"
}
trap trapper EXIT

# get current working directory
owd=$PWD
# get commandline parameter
build_dir=$1

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ -z "$build_dir" ]; then
  echo "<buildname> not specified"
  user_err=1
elif [ -d "$build_dir" ]; then
  echo "build dir $build_dir already exists"
  user_err=1
elif [ ! -f "$HOOT_REPO/README.md" ] || [ -z "$HOOT_REPO" ]; then 
  echo "set the environment variable HOOT_REPO to point"
  echo "to the root of your local hootNAS git repository"
  echo "e.g. HOOT_REPO=/path/to/hootNAS"
  user_err=1
elif [ ! "$(lsb_release -sc)" = "jammy" ]; then
  echo "this script must run on a jammy distro"
  user_err=1
elif [ ! -d "baseos" ]; then
  echo "baseos directory not found in current working directory"
  echo "run build-baseos.sh first"
  user_err=1
elif [ ! -x "$(command -v debootstrap)" ]; then
  echo "debootstrap is not installed"
  echo "please install it with the following command:"
  echo "sudo apt install debootstrap"
  user_err=1
fi

# if user input is incorrect, display usage and exit
if [ $user_err = 1 ]; then
  echo
  echo "usage:"
  echo
  echo "    sudo ./build-hootos.sh <buildname>"
  echo
  echo "where <buildname> is a new build directory"
  echo
  exit 1
fi

# check optional environment variables, if not set, set to default
[ -z "$HOOT_LOCALE" ] && HOOT_LOCALE='en_DE.UTF-8'
[ -z "$HOOT_XKB_LAYOUT" ] && $HOOT_XKB_LAYOUT='de'
[ -z "$HOOT_ZONE" ] && HOOT_ZONE='Europe'
[ -z "$HOOT_CITY" ] && HOOT_CITY='Berlin'

# create build directories
mkdir -p $build_dir/{staging,tmpo,hootos,source}
# cd into build directory
cd $build_dir 

# copy this script to source directory for reference
cp $HOOT_REPO/hoot-os/build-hootos.sh source

# download node.js tarball if it does not exist
if [ ! -f "node-$nodejs_version-linux-x64.tar.xz" ]; then
  echo "downloading node.js tarball"
  wget -q --show-progress \
  https://nodejs.org/dist/${nodejs_version}/node-${nodejs_version}-linux-x64.tar.xz
fi

################################################################################
#                    CONFIGURE BASE SYSTEM                                     #
################################################################################

echo "mounting overlay filesystem"
mount -t overlay overlay \
    -o lowerdir=../baseos,upperdir=staging,workdir=tmpo \
    $PWD/hootos

echo "configuring the package sources"
cat <<EOF >hootos/etc/apt/sources.list
deb http://archive.ubuntu.com/ubuntu \
jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu \
jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu \
jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu \
jammy-security main restricted universe multiverse
EOF

echo "binding filesystems from host to hootos"
mount --make-private --rbind /dev hootos/dev
mount --make-private --rbind /proc hootos/proc
mount --make-private --rbind /sys hootos/sys

echo "configuring hostname"
echo hootnas > hootos/etc/hostname
sed -i "2i 127.0.1.1       hootnas" hootos/etc/hosts

echo "generating locales"
cat <<EOF | chroot hootos
apt update
apt install --yes locales
locale-gen en_US.UTF-8
locale-gen $HOOT_LOCALE
apt install --yes debconf-utils
EOF

echo "configuring locales"
cat <<EOF | chroot hootos
echo "locales locales/locales_to_be_generated multiselect \
$HOOT_LOCALE UTF-8, en_US.UTF-8 UTF-8" | debconf-set-selections
echo "locales locales/default_environment_locale select \
$HOOT_LOCALE" | debconf-set-selections
dpkg-reconfigure --frontend noninteractive locales
EOF

echo "configuring timezone database"
# Etc zone is mainly for backward compatibility of the tz database
# https://github.com/eggert/tz/blob/main/etcetera
# https://github.com/eggert/tz
cat <<EOF | chroot hootos
echo "tzdata tzdata/Zones/Etc select UTC" | debconf-set-selections
echo "tzdata tzdata/Areas select $HOOT_ZONE" | debconf-set-selections
echo "tzdata tzdata/Zones/$HOOT_ZONE select $HOOT_CITY" | debconf-set-selections
dpkg-reconfigure --frontend noninteractive tzdata
EOF

echo "configuring local system timezone"
# at this point system has not been booted with systemd as init system (PID 1) 
# so we can't use timedatectl to set the timezone
rm /etc/localtime
ln -s /usr/share/zoneinfo/$HOOT_ZONE/$HOOT_CITY /etc/localtime

# configure time synchronization servers
# /etc/systemd/timesyncd.conf
#  #[Time]
#  #NTP=
#  #FallbackNTP=ntp.ubuntu.com
#  #RootDistanceMaxSec=5
#  #PollIntervalMinSec=32
#  #PollIntervalMaxSec=2048


echo "configuring keyboard"
# debconf-set-selections doesn't work here when it's a first install
cat <<EOF | chroot hootos
echo "
XKBMODEL=\"$xkb_model\"
XKBLAYOUT=\"$HOOT_XKB_LAYOUT\"
XKBVARIANT=\"\"
XKBOPTIONS=\"\"

BACKSPACE=\"guess\"
"  > /etc/default/keyboard
dpkg-reconfigure --frontend noninteractive keyboard-configuration
EOF

echo "configuring console"
# debconf-set-selections doesn't work here when it's a first install
cat <<EOF | chroot hootos
echo '
ACTIVE_CONSOLES="/dev/tty[1-6]"

CHARMAP="UTF-8"

CODESET="Lat15"
FONTFACE="Fixed"
FONTSIZE="8x16"

VIDEOMODE=
'  > /etc/default/console-setup
dpkg-reconfigure --frontend noninteractive console-setup
EOF

echo "installing kernels headers and modules"
# check if host kernel version is the same as $kernel_version
if [ ! "$(uname -r)" = "$kernel_version" ]; then
  echo "WARNING: host kernel version $(uname -r) is not the same"
  echo "as $kernel_version which is the kernel version that will be"
  echo "installed. Beware of any problems that may arise from this."
fi
chroot hootos apt install --yes linux-image-$kernel_version
# chroot hootos apt install --yes linux-headers-$kernel_version
# zfs module is in linux-modules-extra
chroot hootos apt install --yes linux-modules-extra-$kernel_version

# if metal, install firmware
if [ "$build" = "metal" ]; then
  chroot hootos apt install --yes linux-firmware
  chroot hootos apt install --yes intel-microcode
  chroot hootos apt install --yes amd64-microcode
  chroot hootos apt install --yes thermald
fi

echo "installing packages"
cat <<'EOF' | chroot hootos
apt install --yes man-db
apt install --yes wget
apt install --yes openssh-client
apt install --yes openssh-server 
apt install --yes gdisk 
apt install --yes dialog
apt install --yes zfsutils-linux
apt install --yes zfs-initramfs
# apt install --yes btrfs-progs
apt install --yes live-boot 
apt install --yes nfs-kernel-server
apt install --yes tgt
apt install --yes samba
apt install --yes sqlite3
EOF

# copy in custom live-boot scripts directory if it exists
custom_live_boot=$HOOT_REPO/live-boot/src/live-boot/lib/live/boot
if [ -d "$custom_live_boot" ]; then
  echo "copy in custom live-boot scripts"
  cp -r $custom_live_boot/* hootos/lib/live/boot
fi

echo "cleaning up"
# avoids error messages from update-grub. os-prober is only necessary in 
# dual-boot configurations.
chroot hootos apt purge --yes os-prober
chroot hootos apt --yes update
chroot hootos apt --purge --yes autoremove
chroot hootos apt --yes clean

echo "update the initrd files"
chroot hootos update-initramfs -c -k all

################################################################################
#                                USERSPACE                                     #
################################################################################

echo "configuring network for Systemd-networkd"
# all ethernet links: en*
cat <<EOF >hootos/etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      match:
        name: en*
      dhcp4: yes
EOF

# setting up node.js
echo "setting up node.js"
mkdir -p hootos/usr/bin/nodejs
tar -xJvf node-${nodejs_version}-linux-x64.tar.xz \
-C hootos/usr/bin/nodejs >/dev/null
# adding node.js binary to PATH
echo "adding node.js binary to PATH"
sed -i "s|\"$|:/usr/bin/nodejs/node-${nodejs_version}-linux-x64/bin\"|" \
  hootos/etc/environment

# copy in db directory if exists
db=$HOOT_REPO/db
if [ -d "$db" ]; then
  echo "creating directory /usr/local/hootnas/db"
  mkdir -p hootos/usr/local/hootnas/db
  echo "copy in hootnas db"
  cp -r $db/* hootos/usr/local/hootnas/db
fi

# run hoot.sql to create empty database
echo "creating empty database"
cat <<'EOF' | chroot hootos
cd /usr/local/hootnas/db
rm hoot.db
sqlite3 hoot.db < hoot.sql
EOF

# copy in bash scripts if source directory exists
# configure onlogin.sh to run on login
bash_scripts=$HOOT_REPO/scripts
if [ -d "$bash_scripts" ]; then
  echo "creating directory /root/scripts"
  mkdir -p hootos/root/scripts
  echo "copy in bash scripts"
  cp -r $bash_scripts/* hootos/root/scripts
  chmod 0644 hootos/root/scripts/onlogin.sh
  # insert command to run onlogin.sh at line no. 6 in .profile
  sed -i "6i\    . ~/scripts/onlogin.sh" hootos/root/.profile
fi

# copy in hootnas webserver if source directory exists
# and create systemd service for target webserver/webserver.mjs. 
webserver=$HOOT_REPO/webserver
if [ -d "$webserver" ]; then
  echo "creating directory /usr/local/hootnas/webserver"
  mkdir -p hootos/usr/local/hootnas/webserver
  echo "copy in hootnas webserver source"
  cp -r $webserver/* hootos/usr/local/hootnas/webserver

  # hootnas webserver service unit file
  echo "creating hootnas webserver service unit file"
  cat <<EOF >hootos/etc/systemd/system/hootsrv.service
[Unit]
Description=Start hootNAS webserver when network is up
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
ExecStart=/usr/local/hootnas/webserver/webserver.mjs
[Install]
WantedBy=multi-user.target
EOF

  echo "set permissions on unit file and executable"
  echo "for hootnas webserver service"
  chmod 0664 hootos/etc/systemd/system/hootsrv.service
  chmod 0744 hootos/usr/local/hootnas/webserver/webserver.mjs

  # enable hootnas webserver service
  echo "enabling hootsrv.service service"
  chroot hootos systemctl enable systemd-networkd-wait-online.service
  chroot hootos systemctl enable hootsrv.service
fi

# enable nfs server
chroot hootos systemctl enable nfs-kernel-server.service

# copy in webapp if source directory exists
# make sure you have built the webapp 'npm run build' in the webapp directory
# before running this script
webapp=$HOOT_REPO/webapp/dist
if [ -d "$webapp" ]; then
  echo "creating directory /usr/local/hootnas"
  mkdir -p hootos/usr/local/hootnas/webapp/dist
  echo "copy in hootnas webapp"
  cp -r $webapp/* hootos/usr/local/hootnas/webapp/dist
fi

# copy in webapi if source directory exists
webapi=$HOOT_REPO/webapi
if [ -d "$webapi" ]; then
  echo "creating directory /usr/local/hootnas"
  mkdir -p hootos/usr/local/hootnas/webapi
  echo "copy in hootnas webapi"
  cp -r $webapi/* hootos/usr/local/hootnas/webapi
fi

echo "customizing login"
# make root tty autologin
# -a auto login, -i don't print issue
echo "make root tty autologin"
sed -i 's|ExecStart.*|ExecStart=-/sbin/agetty -i -a root --noclear %I $TERM|' \
  hootos/lib/systemd/system/getty@.service

# configuring root ssh access
echo "configuring root ssh access"
sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' hootos/etc/ssh/sshd_config
echo "configuring root password"
cat <<'EOF' | chroot hootos
echo "root:$(printf 'pass1234' | openssl passwd -6 -salt Zf4aH -stdin)" | \
chpasswd -e
EOF

# clear history
echo "clearing history"
cat <<EOF | chroot hootos
history -c
history -w
EOF



