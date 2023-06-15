#!/bin/bash
#
# usage:
#
#     sudo build-syshoot.sh <projectname>
#
# where <projectname> is a new project directory
#
# this script will create subfolders <projectname>/syshoot in the current 
# working directory, the syshoot folder will contain the hootOS system. 
# 
# it is advisable not to execute this script inside the hootNAS git repository, 
# as it will create a copious amount of files, which may clog the visual studio 
# code git extension.
#
# requirements:
# - you must set the environment variable HOOT_REPO to point to the root of
#   your local hootNAS git repository
# - internet connection
# - must be run as root on a jammy distro
# - debootstrap package installed.
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
# set the build variable to either 'metal' or 'virtual'
# build 'metal' system which includes firmware and microcode, 
# or 'virtual' system which doesn't include firmware and microcode
build=metal
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
    echo "system created"
    echo "if required you can now edit it"
    echo "or you create an iso file by running:"
    echo "sudo ./build-hootiso.sh $project_dir"
    echo
  fi
  # lazy umount because it's mounted recusively with --rbind
  if [ "$(mountpoint -q syshoot/dev ; echo $?)" = 0 ]; then
    umount -lf syshoot/dev
  fi
  if [ "$(mountpoint -q syshoot/proc ; echo $?)" = 0 ]; then
    umount -lf syshoot/proc
  fi
  if [ "$(mountpoint -q syshoot/sys ; echo $?)" = 0 ]; then
    umount -lf syshoot/sys
  fi
  # if current working directory is project_dir, cd down one level
  if [ "$(basename $PWD)" = "$project_dir" ]; then
    cd ..
  fi
  # calculate duration
  duration=$SECONDS
  duration_minutes=$(($duration / 60))
  duration_seconds=$(($duration % 60))
  run_time=$(echo "total runtime $duration_minutes minutes \
  and $duration_seconds seconds")
  echo "$run_time"
}
trap trapper EXIT

# get commandline parameter
project_dir=$1

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ -z "$project_dir" ]; then
  echo "<projectname> not specified"
  user_err=1
elif [ -d "$project_dir" ]; then
  echo "project dir $project_dir already exists"
  user_err=1
elif [ ! -f "$HOOT_REPO/README.md" ] || [ -z "$HOOT_REPO" ]; then 
  echo "set the environment variable HOOT_REPO to point"
  echo "to the root of your local hootNAS git repository"
  echo "e.g. HOOT_REPO=/path/to/hootNAS"
  user_err=1
elif [ ! "$(lsb_release -sc)" = "jammy" ]; then
  echo "this script must run on a jammy distro"
  user_err=1
fi

if [ $user_err = 1 ]; then
  echo
  echo "usage:"
  echo
  echo "    sudo ./build-syshoot.sh <projectname>"
  echo
  echo "where <projectname> is a new project directory"
  echo
  exit 1
fi

# check optional environment variables, if not set, set to default
if [ -z "$HOOT_LOCALE" ]; then HOOT_LOCALE='en_DE.UTF-8'; fi
if [ -z "$HOOT_XKB_LAYOUT" ]; then $HOOT_XKB_LAYOUT='de'; fi
if [ -z "$HOOT_ZONE" ]; then HOOT_ZONE='Europe'; fi
if [ -z "$HOOT_CITY" ]; then HOOT_CITY='Berlin'; fi

# create project and syshoot dir if it does not exist
mkdir -p $project_dir/syshoot
cd $project_dir # cd into project dir

# download node.js tarball if it does not exist
if [ ! -f "node-$nodejs_version-linux-x64.tar.xz" ]; then
  echo "downloading node.js tarball"
  wget -q --show-progress \
  https://nodejs.org/dist/${nodejs_version}/node-${nodejs_version}-linux-x64.tar.xz
fi

################################################################################
#                    BASE SYSTEM AND EARLY USERSPACE                           #
################################################################################
echo "installing base system"
debootstrap jammy syshoot

echo "configuring the package sources"
cat <<EOF >syshoot/etc/apt/sources.list
deb http://archive.ubuntu.com/ubuntu \
jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu \
jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu \
jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu \
jammy-security main restricted universe multiverse
EOF

echo "binding filesystems from host to new system"
mount --make-private --rbind /dev syshoot/dev
mount --make-private --rbind /proc syshoot/proc
mount --make-private --rbind /sys syshoot/sys

echo "configure hostname"
echo hootnas >syshoot/etc/hostname
sed -i "2i 127.0.1.1       hootnas" syshoot/etc/hosts

echo "generating locales"
cat <<EOF | chroot syshoot
apt update
apt install --yes locales
locale-gen en_US.UTF-8
locale-gen $HOOT_LOCALE
apt install --yes debconf-utils
EOF

echo "configuring locales"
cat <<EOF | chroot syshoot
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
cat <<EOF | chroot syshoot
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
cat <<EOF | chroot syshoot
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
cat <<EOF | chroot syshoot
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
# install same kernel version as host
chroot syshoot apt install --yes linux-image-$(uname -r)
# chroot syshoot apt install --yes linux-headers-$(uname -r)
# zfs module is in linux-modules-extra
chroot syshoot apt install --yes linux-modules-extra-$(uname -r)

# if metal, install firmware
if [ "$build" = "metal" ]; then
  chroot syshoot apt install --yes linux-firmware
  chroot syshoot apt install --yes intel-microcode
  chroot syshoot apt install --yes amd64-microcode
  chroot syshoot apt install --yes thermald
fi

echo "installing packages"
cat <<'EOF' | chroot syshoot
apt install --yes man-db
apt install --yes wget
apt install --yes openssh-client
apt install --yes openssh-server 
apt install --yes gdisk 
apt install --yes dialog
apt install --yes zfsutils-linux
apt install --yes btrfs-progs
apt install --yes live-boot # hook for initramfs-tools
apt install --yes nfs-kernel-server
apt install --yes tgt
apt install --yes samba
apt install --yes sqlite3
EOF

echo "cleaning up"
chroot syshoot apt purge --yes os-prober
chroot syshoot apt --yes update
chroot syshoot apt --purge --yes autoremove
chroot syshoot apt --yes clean

echo "update the initrd files"
chroot syshoot update-initramfs -c -k all

################################################################################
#                                USERSPACE                                     #
################################################################################

echo "configuring network for Systemd-networkd"
# all ethernet links: en*
cat <<EOF >syshoot/etc/netplan/01-netcfg.yaml
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
mkdir -p syshoot/usr/bin/nodejs
tar -xJvf node-${nodejs_version}-linux-x64.tar.xz \
-C syshoot/usr/bin/nodejs >/dev/null
# adding node.js binary to PATH
echo "adding node.js binary to PATH"
sed -i "s|\"$|:/usr/bin/nodejs/node-${nodejs_version}-linux-x64/bin\"|" \
  syshoot/etc/environment

# copy in db directory if exists
db=$HOOT_REPO/db
if [ -d "$db" ]; then
  echo "creating directory /usr/local/hootnas/db"
  mkdir -p syshoot/usr/local/hootnas/db
  echo "copy in hootnas db"
  cp -r $db/* syshoot/usr/local/hootnas/db
fi

# run hoot.sql to create empty database
echo "creating empty database"
cat <<'EOF' | chroot syshoot
cd /usr/local/hootnas/db
rm hoot.db
sqlite3 hoot.db < hoot.sql
EOF

# copy in bash scripts if source directory exists
# configure onlogin.sh to run on login
bash_scripts=$HOOT_REPO/scripts
if [ -d "$bash_scripts" ]; then
  echo "creating directory /root/scripts"
  mkdir -p syshoot/root/scripts
  echo "copy in bash scripts"
  cp -r $bash_scripts/* syshoot/root/scripts
  chmod 0644 syshoot/root/scripts/onlogin.sh
  # insert command to run onlogin.sh at line no. 6 in .profile
  sed -i "6i\    . ~/scripts/onlogin.sh" syshoot/root/.profile
fi

# copy in hootnas webserver if source directory exists
# and create systemd service for target webserver/webserver.mjs. 
webserver=$HOOT_REPO/webserver
if [ -d "$webserver" ]; then
  echo "creating directory /usr/local/hootnas/webserver"
  mkdir -p syshoot/usr/local/hootnas/webserver
  echo "copy in hootnas webserver source"
  cp -r $webserver/* syshoot/usr/local/hootnas/webserver

  # hootnas webserver service unit file
  echo "creating hootnas webserver service unit file"
  cat <<EOF >syshoot/etc/systemd/system/hootsrv.service
[Unit]
Description=Start hootNAS webserver when network is up
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
ExecStart=/usr/local/hootnas/webserver/webserver.mjs
[Install]
WantedBy=multi-user.target
EOF

  echo "set permissions on unit file and executable"
  echo "for hootnas webserver service"
  chmod 0664 syshoot/etc/systemd/system/hootsrv.service
  chmod 0744 syshoot/usr/local/hootnas/webserver/webserver.mjs

  # enable hootnas webserver service
  echo "enabling hootsrv.service service"
  chroot syshoot systemctl enable systemd-networkd-wait-online.service
  chroot syshoot systemctl enable hootsrv.service
fi

# enable nfs server
chroot syshoot systemctl enable nfs-kernel-server.service

# copy in webapp if source directory exists
# make sure you have built the webapp 'npm run build' in the webapp directory
# before running this script
webapp=$HOOT_REPO/webapp/dist
if [ -d "$webapp" ]; then
  echo "creating directory /usr/local/hootnas"
  mkdir -p syshoot/usr/local/hootnas/webapp/dist
  echo "copy in hootnas webapp"
  cp -r $webapp/* syshoot/usr/local/hootnas/webapp/dist
fi

# copy in webapi if source directory exists
webapi=$HOOT_REPO/webapi
if [ -d "$webapi" ]; then
  echo "creating directory /usr/local/hootnas"
  mkdir -p syshoot/usr/local/hootnas/webapi
  echo "copy in hootnas webapi"
  cp -r $webapi/* syshoot/usr/local/hootnas/webapi
fi

echo "customizing login"
# make root tty autologin
# -a auto login, -i don't print issue
echo "make root tty autologin"
sed -i 's|ExecStart.*|ExecStart=-/sbin/agetty -i -a root --noclear %I $TERM|' \
  syshoot/lib/systemd/system/getty@.service

# configuring root ssh access
echo "configuring root ssh access"
sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' syshoot/etc/ssh/sshd_config
echo "configuring root password"
cat <<'EOF' | chroot syshoot
echo "root:$(printf 'pass1234' | openssl passwd -6 -salt Zf4aH -stdin)" | \
chpasswd -e
EOF

# clear history
echo "clearing history"
cat <<EOF | chroot syshoot
history -c
history -w
EOF
