#!/bin/bash
#
# this script will build a hootos system in a subdirectory of the current
# working directory. see the README.md in this directory for the full story.
# 
# requirements:
# - the baseos must be built first with build-baseos.sh, and the baseos 
#   directory must be in the current working directory.
# - you must set the environment variable HOOT_REPO to point to the root of
#   your local hootNAS git repository
# - internet connection
# - must be run as root on a jammy distro
#
# usage:
#
#     sudo build-hootos.sh <buildname> <optional parameter>=<value>
#
# where <buildname> is a new build directory that will be created in the current
# working directory. The buildname must not exist yet.
#
# If an <optional parameter> is not specified in the commandline, it will use 
# its default value as per below table:
#
#     <optional parameter>  default <value>
#     -------------------------------------
#     set-locale            en_US.UTF-8
#     set-xkb-layout        us
#     set-xkb-model         pc105
#     set-zone              Europe
#     set-city              Berlin
#     kernel-version        6.2.0-26-generic
#     build-type            virtual
#     nodejs-version        v18.12.0
#
#   comments:
#   1. set-locale) see supported locales: /usr/share/i18n/SUPPORTED
#   2. set-xkb-layout) see supported layouts: /usr/share/X11/xkb/rules/evdev.lst
#   3. set-xkb-model) convenient if you are going to be working physically in
#   front of the machine, so you can use the correct keyboard layout.
#   model 'pc105' is a good general choice for most keyboards
#   see supported keyboard settings: /usr/share/X11/xkb/rules/evdev.lst
#   4. set-zone and set-city) setting up local timezone and city is especially 
#   important for LDAP/AD authentication. 
#   see supported cities and timezones: /usr/share/zoneinfo
#   5. kernel-version) set the kernel version to be installed, we want to be in
#   control of which kernel version is installed, so we can detect any problems 
#   that may arise from a kernel upgrade.
#   6. build-type) if 'virtual' this script will build a system which doesn't 
#   include firmware and microcode. if 'metal', the system will include both 
#   firmware and microcode.
#   7. nodejs-version) set the node.js version to be installed.
#
################################################################################

# start measuring time
SECONDS=0

# error handler, called on non-zero exit codes
function trapper {
  original_exit_code=$?
  # if user input is incorrect, display usage and exit
  if [ $user_err = 1 ]; then
    echo "usage:"
    echo
    echo "    sudo build-hootos.sh <buildname> <optional parameter>=<value>"
    echo
    echo "where <buildname> is a new build directory that will be created in the current"
    echo "working directory. The buildname must not exist yet."
    echo
    echo "If an <optional parameter> is not specified in the commandline, it will use "
    echo "its default value as per below table:"
    echo
    echo "    <optional parameter>  default <value>"
    echo "    -------------------------------------"
    echo "    set-locale            en_DE.UTF-8"
    echo "    set-xkb-layout        de"
    echo "    set-xkb-model         pc105"
    echo "    set-zone              Europe"
    echo "    set-city              Berlin"
    echo "    kernel-version        6.2.0-26-generic"
    echo "    build-type            virtual"
    echo "    nodejs-version        v18.12.0"
    echo
    echo "For more information, see comments at the begining of this script, or"
    echo "$HOOT_REPO/hoot-os/README.md for more information."
  elif [ $original_exit_code -ne 0 ]; then
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
  # cleanup
  #
  # lazy umount because it's mounted recusively with --rbind
  [ "$(mountpoint -q hootos/dev ; echo $?)" = 0 ] && umount -lf hootos/dev
  [ "$(mountpoint -q hootos/proc ; echo $?)" = 0 ] && umount -lf hootos/proc
  [ "$(mountpoint -q hootos/sys ; echo $?)" = 0 ] && umount -lf hootos/sys
  # if node tarball exists, delete it
  [ -f "/tmp/node-${nodejs_version}-linux-x64.tar.xz" ] && \
    rm /tmp/node-${nodejs_version}-linux-x64.tar.xz
  # unmount overlay filesystem
  [ "$(mountpoint -q $PWD/hootos ; echo $?)" = 0 ] && umount $PWD/hootos
  # delete overwork directory
  [ -d "overwork" ] && rm -r overwork
  # return to original working directory
  cd $owd
  # calculate duration
  duration=$SECONDS
  duration_min=$(($duration / 60))
  duration_sec=$(($duration % 60))
  echo "runtime $duration_min minutes and $duration_sec seconds"
}
trap trapper EXIT

#
# SETUP ENVIRONMENT
#

# get current working directory
owd=$PWD

# get build_dir commandline parameter
build_dir=$1
shift
# get all commandline parameters
for comarg in "$@"
do
  case "${comarg}" in
    set-locale=*)
      set_locale="${comarg#set-locale=}"
    ;;
    set-xkb-layout=*)
      xkb_layout="${comarg#set-xkb-layout=}"
    ;;
    set-xkb-model=*)
      xkb_model="${comarg#set-xkb-model=}"
    ;;
    set-zone=*)
      set_zone="${comarg#set-zone=}"
    ;;
    set-city=*)
      set_city="${comarg#set-city=}"
    ;;
    kernel-version=*)
      kernel_version="${comarg#kernel-version=}"
    ;;
    build-type=*)
      build_type="${comarg#build-type=}"
    ;;
    nodejs-version=*)
      nodejs_version="${comarg#nodejs-version=}"
    ;;
  esac
done

# set default values for optional variables if not set in commandline parameters
[ -z "$set_locale" ] && set_locale='en_US.UTF-8'
[ -z "$xkb_layout" ] && xkb_layout='us'
[ -z "$xkb_model" ] && xkb_model='pc105'
[ -z "$set_zone" ] && set_zone='Europe'
[ -z "$set_city" ] && set_city='Berlin'
[ -z "$kernel_version" ] && kernel_version='6.2.0-26-generic'
[ -z "$build_type" ] && build_type='virtual'
[ -z "$nodejs_version" ] && nodejs_version='v18.12.0'

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

[ $user_err = 1 ] && exit 0

# create build directories
mkdir -p $build_dir/{staging,hootos,source}
# cd into build directory
cd $build_dir 

# copy this script to source directory for reference
cp $HOOT_REPO/hoot-os/build-hootos.sh source

# download node.js tarball if it does not exist
if [ ! -f "node-$nodejs_version-linux-x64.tar.xz" ]; then
  echo "downloading node.js tarball"
  wget -P /tmp -q --show-progress \
  https://nodejs.org/dist/${nodejs_version}/node-${nodejs_version}-linux-x64.tar.xz
fi

echo "mounting overlay filesystem"
mkdir -p overwork
mount -t overlay overlay \
    -o lowerdir=../baseos,upperdir=staging,workdir=overwork \
    $PWD/hootos

echo "binding filesystems from host to hootos"
mount --make-private --rbind /dev hootos/dev
mount --make-private --rbind /proc hootos/proc
mount --make-private --rbind /sys hootos/sys

#
# SYSTEM INSTALL PREREQUISITES
#

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

echo "configuring hostname"
echo hootnas > hootos/etc/hostname
sed -i "2i 127.0.1.1       hootnas" hootos/etc/hosts

echo "generating locales"
cat <<EOF | chroot hootos
apt update
apt install --yes locales
locale-gen en_US.UTF-8
EOF

# if $set_locale is not en_US.UTF-8, generate it
[ ! "$set_locale" = "en_US.UTF-8" ] && chroot hootos locale-gen $set_locale

chroot hootos apt install --yes debconf-utils

echo "configuring locales"
# if $set_locale is not en_US.UTF-8, set multiselect
[ ! "$set_locale" = "en_US.UTF-8" ] && chroot hootos \
  echo "locales locales/locales_to_be_generated multiselect \
  $set_locale UTF-8, en_US.UTF-8 UTF-8" | debconf-set-selections
# set default_environment_locale
chroot hootos \
  echo "locales locales/default_environment_locale select \
  $set_locale" | debconf-set-selections

chroot hootos dpkg-reconfigure --frontend noninteractive locales

echo "configuring timezone database"
# Etc zone is mainly for backward compatibility of the tz database
# https://github.com/eggert/tz/blob/main/etcetera
# https://github.com/eggert/tz
cat <<EOF | chroot hootos
echo "tzdata tzdata/Zones/Etc select UTC" | debconf-set-selections
echo "tzdata tzdata/Areas select $set_zone" | debconf-set-selections
echo "tzdata tzdata/Zones/$set_zone select $set_city" | debconf-set-selections
dpkg-reconfigure --frontend noninteractive tzdata
EOF

echo "configuring local system timezone"
# at this point system has not been booted with systemd as init system (PID 1) 
# so we can't use timedatectl to set the timezone
rm /etc/localtime
ln -s /usr/share/zoneinfo/$set_zone/$set_city /etc/localtime

echo "configuring keyboard"
# debconf-set-selections doesn't work here when it's a first install
cat <<EOF | chroot hootos
echo "
XKBMODEL=\"$xkb_model\"
XKBLAYOUT=\"$xkb_layout\"
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

#
# INSTALL KERNEL, FIRMWARE AND SOFTWARE
#

echo "installing kernels headers and modules"
# check if host kernel version is the same as $kernel_version
if [ ! "$(uname -r)" = "$kernel_version" ]; then
  echo "WARNING: host kernel version $(uname -r) is not the same"
  echo "as $kernel_version which is the kernel version that will be"
  echo "installed. Beware of any problems that may arise from this."
fi
chroot hootos apt install --yes linux-image-$kernel_version
# zfs module is in linux-modules-extra
chroot hootos apt install --yes linux-modules-extra-$kernel_version

# if metal, install firmware
if [ "$build_type" = "metal" ]; then
  chroot hootos apt install --yes linux-firmware
  chroot hootos apt install --yes intel-microcode
  chroot hootos apt install --yes amd64-microcode
  chroot hootos apt install --yes thermald
else
  # just install what's needed for live-boot
  tar -xzf $HOOT_REPO/hoot-os/assets/i915-firmware.tar.gz \
      -C hootos/lib/firmware
fi

# TODO: add check for live-boot version
echo "installing software"
cat <<'EOF' | chroot hootos
apt install --yes man-db
apt install --yes wget
apt install --yes ufw
apt install --yes openssh-client
apt install --yes openssh-server 
apt install --yes gdisk 
apt install --yes dialog
apt install --yes zfsutils-linux
apt install --yes zfs-initramfs
apt install --yes live-boot 
apt install --yes nfs-kernel-server
apt install --yes tgt
apt install --yes samba
apt install --yes sqlite3
EOF

# copy in custom live-boot scripts directory if it exists
custom_live_boot=$HOOT_REPO/live-boot/src/live-boot/lib/live/boot
if [ -d "$custom_live_boot" ]; then
  [ -d "hootos/lib/live/boot" ] && rm -r hootos/lib/live/boot
  echo "copy in custom live-boot scripts"
  cp -r $custom_live_boot hootos/lib/live
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

#
# SYSTEM CONFIGURATION
#

# configure journald logging storage mode and size, see: man journald.conf
# The storage mode is default "auto" which behaves like "persistent" if the 
# /var/log/journal directory exists, and "volatile" otherwise with logging 
# in /run/log/journal. Let's set it to "volatile" just to make sure, and
# set the maximum size of the journal files to 8M in both modes.
sed -i 's/^#\{0,1\}Storage.*$/Storage=volatile/' \
  hootos/etc/systemd/journald.conf
sed -i 's/^#\{0,1\}SystemMaxUse.*$/SystemMaxUse=8M/' \
  hootos/etc/systemd/journald.conf
sed -i 's/^#\{0,1\}RuntimeMaxUse.*$/RuntimeMaxUse=8M/' \
  hootos/etc/systemd/journald.conf
rm -r hootos/var/log/journal

# configure time synchronization servers, see: man timesyncd.conf
# /etc/systemd/timesyncd.conf contains commented out entries showing the
# defaults: FallbackNTP=ntp.ubuntu.com
# time being there is no requirement for setting up time servers.

# enable nfs server
chroot hootos systemctl enable nfs-kernel-server.service

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
tar -xJvf /tmp/node-${nodejs_version}-linux-x64.tar.xz \
-C hootos/usr/bin/nodejs >/dev/null
# adding node.js binary to PATH
echo "adding node.js binary to PATH"
sed -i "s|\"$|:/usr/bin/nodejs/node-${nodejs_version}-linux-x64/bin\"|" \
  hootos/etc/environment

# create directories for hootnas
mkdir -p hootos/usr/local/hootnas/{db,webserver,webapp/dist,webapi,scripts}

# copy in db directory if exists
db=$HOOT_REPO/db
if [ -d "$db" ]; then
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

# copy in tui-network-config if it exists
if [ -f "$HOOT_REPO/scripts/tui-network-config.sh" ]; then
  cp -r $HOOT_REPO/scripts/tui-network-config.sh hootos/root
  # # insert command to run tui-network-config.sh at line no. 6 in .profile
  sed -i "6i\    . ~/tui-network-config.sh" hootos/root/.profile
  chmod 0644 hootos/root/tui-network-config.sh
fi

# copy in hootnas webserver if source directory exists
if [ -f "$HOOT_REPO/webserver/webserver.mjs" ] && \
  [ -f "$HOOT_REPO/scripts/hootsrv.service" ]; then
  echo "copy in hootnas webserver source"
  cp -r $HOOT_REPO/webserver/* hootos/usr/local/hootnas/webserver
  chmod 0744 hootos/usr/local/hootnas/webserver/webserver.mjs
  echo "copy in hootsrv.service"
  cp $HOOT_REPO/scripts/hootsrv.service hootos/etc/systemd/system
  chmod 0664 hootos/etc/systemd/system/hootsrv.service
  chroot hootos systemctl enable systemd-networkd-wait-online.service
  chroot hootos systemctl enable hootsrv.service
fi

# this feature checks if persistence is active and enables or disables the 
# TUI network configuration script, and starts a tty with or without root 
# autologin accordingly.
# see: man systemd.unit and man systemd.service, and conditionlogin.sh
echo "configuring root tty autologin and TUI network configuration script"
if [ -f "$HOOT_REPO/scripts/conditionlogin.sh" ]; then
  cp $HOOT_REPO/scripts/conditionlogin.sh hootos/usr/local/hootnas/scripts
  chmod 0744 hootos/usr/local/hootnas/scripts/conditionlogin.sh
  mkdir hootos/etc/systemd/system/getty@.service.d
  cat <<'EOF' > hootos/etc/systemd/system/getty@.service.d/override.conf
[Service]
ExecStart=
ExecStart=/usr/local/hootnas/scripts/conditionlogin.sh %I $TERM
EOF
fi

# copy in webapp if source directory exists
# make sure you have built the webapp 'npm run build' in the webapp directory
# before running this script
if [ -d "$HOOT_REPO/webapp/dist" ]; then
  echo "copy in hootnas webapp"
  cp -r $HOOT_REPO/webapp/dist/* hootos/usr/local/hootnas/webapp/dist
fi

# copy in webapi if source directory exists
if [ -d "$HOOT_REPO/webapi" ]; then
  echo "copy in hootnas webapi"
  cp -r $HOOT_REPO/webapi/* hootos/usr/local/hootnas/webapi
fi

# configuring root ssh access
echo "configuring root ssh access"
sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' hootos/etc/ssh/sshd_config
echo "configuring root password"
cat <<'EOF' | chroot hootos
echo "root:$(printf 'pass1234' | openssl passwd -6 -salt Zf4aH -stdin)" | \
chpasswd -e
EOF

# setting up firewall rules
# ports definitions see: /etc/services
echo 'setting up firewall'
cat <<EOF | chroot hootos
echo y | ufw enable
ufw allow ssh               comment 'SSH Remote Login Protocol'
ufw allow out ssh           comment 'SSH Remote Login Protocol'
ufw allow domain            comment 'Domain Name Server'
ufw allow out domain        comment 'Domain Name Server'
ufw allow http              comment 'WorldWideWeb HTTP'
ufw allow out http          comment 'WorldWideWeb HTTP'
ufw allow https             comment 'http protocol over TLS/SSL'
ufw allow out https         comment 'http protocol over TLS/SSL'
ufw allow nfs               comment 'Network File System'
ufw allow out nfs           comment 'Network File System'
ufw allow microsoft-ds      comment 'Microsoft Naked CIFS'
ufw allow out microsoft-ds  comment 'Microsoft Naked CIFS'
ufw allow netbios-ns        comment 'NETBIOS Name Service'
ufw allow out netbios-ns    comment 'NETBIOS Name Service'
ufw allow netbios-dgm       comment 'NETBIOS Datagram Service'
ufw allow out netbios-dgm   comment 'NETBIOS Datagram Service'
ufw allow netbios-ssn       comment 'NETBIOS session service'
ufw allow out netbios-ssn   comment 'NETBIOS session service'
ufw allow out loc-srv       comment 'DCE endpoint resolution'
ufw allow iscsi-target      comment 'iSCSI Internet Small Computer Systems Interface'
ufw allow out iscsi-target  comment 'iSCSI Internet Small Computer Systems Interface'
ufw allow 5985/tcp          comment 'WinRM HTTP'
ufw allow out 5985/tcp      comment 'WinRM HTTP'
ufw allow 5986/tcp          comment 'WinRM HTTPS'
ufw allow out 5986/tcp      comment 'WinRM HTTPS'
ufw allow out ldap          comment 'Lightweight Directory Access Protocol'
ufw allow out ldaps         comment 'LDAP over SSL'
ufw allow out ntp           comment 'Network Time Protocol'
ufw allow kerberos          comment 'Kerberos v5'
ufw allow out kerberos      comment 'Kerberos v5'
ufw default deny outgoing
EOF

# clear some logs
echo "clearing logs"
find hootos/var/log -name "*.log" -type f -exec sh -c 'echo "" > "$1"' _ {} \;
# clear history
echo "clearing history"
cat <<EOF | chroot hootos
history -c
history -w
EOF



