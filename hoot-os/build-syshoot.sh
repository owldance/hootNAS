#!/bin/bash
#
# usage:
#
#     sudo ./build-syshoot.sh <projectname>
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
# - internet connection
# - must be run as root on a jammy distro
# - debootstrap package installed
#

################################################################################
#                            USER VARIABLES
################################################################################
#
# you must set the full path to this local hootNAS git repository directory
repo_dir=/home/username/Documents/hootNAS
#
# optional, you can set all the following variables to your liking
#
# set the build variable to either 'metal' or 'virtual'
# build 'metal' system which includes firmware and microcode, 
# or 'virtual' system which doesn't include firmware and microcode
build=metal
# set the locale, supported UTF-8 locales: /usr/share/i18n/SUPPORTED
locale=en_US.UTF-8
# keyboard settings, convenient if you are going to be working in the terminal. 
# supported keyboard settings: /usr/share/X11/xkb/rules/evdev.lst
xkb_model=pc105
xkb_layout=us
# set the timezone, this is especially important for LDAP/AD authentication
# supported timezones: /usr/share/zoneinfo
# etc setting is mainly for backward compatibility of the tz database
# https://github.com/eggert/tz/blob/main/etcetera
# https://github.com/eggert/tz
etc=UTC 
zone=Europe
city=Berlin
# download and install node.js
nodejs_version=18.12.0
# copy in interactive network configuration script for terminal (tty)
config_script=$repo_dir/tty/network-config.sh
# if directory exist, copy in webserver and create systemd service for 
# target webserver/server.mjs. the webserver serves both the web management
# app and the webAPI endpoints on port 80
webserver=$repo_dir/webserver
# if directory exist, copy in web management app with 
# target webapp/dist/index.html
webapp=$repo_dir/webapp
# if directory exist, copy in webAPI endpoints
webapi=$repo_dir/webapi
#
################################################################################

# get commandline parameter
project_dir=$1

# start measuring time
SECONDS=0

# set bash options
# -e            exit immediately if any command returns non-zero exit status
# -o pipefail   use exit status of the last command as exit status
set -e -o pipefail

# error handler, called on non-zero exit codes
function trapper {
  if [ $? -ne 0 ]; then
    echo "fatal error: something didn't go as expected"
  else
    echo
    echo "system created"
    echo "if required you can now edit it"
    echo "or you create an iso file by running:"
    echo "sudo ./build-hootiso.sh $project_dir"
    echo
  fi
  # lazy umount because it's mounted recusively with --rbind
  umount -lf syshoot/dev
  umount -lf syshoot/proc
  umount -lf syshoot/sys
  # cd out of project dir
  cd ..
  # calculate duration
  duration=$SECONDS
  duration_minutes=$(($duration / 60))
  duration_seconds=$(($duration % 60))
  run_time=$(echo "total runtime $duration_minutes minutes \
  and $duration_seconds seconds")
  echo "$run_time"
}
trap trapper EXIT

# are we root?
if [ "$EUID" -ne 0 ] || ! [[ $project_dir =~ ^[0-9a-zA-Z._-]+$ ]]; then
  echo "must run as root"
  echo
  echo "usage "
  echo "     sudo ./build-syshoot.sh <projectname>"
  echo
  echo "where <projectname> only contains [0-9a-zA-Z._-]"
  echo
  exit 1
fi

# check if we are running on ubuntu jammy
if [ ! "$(lsb_release -sc)" = "jammy" ]; then
  echo "this script must run on a jammy distro"
  echo
  exit 1
fi

# check if working directory exists
if [ -d "$project_dir" ]; then
  echo "project dir $project_dir already exists"
  echo
  exit 1
fi

# check if required packages are installed, if not - install them
deb_paks='debootstrap'
for deb_pak in $deb_paks; do
  deb_db_status="$(dpkg-query -W --showformat='${db:Status-Status}' "$deb_pak" 2>&1)"
  if [ ! $? = 0 ] || [ ! "$deb_db_status" = installed ]; then
    apt install --yes $deb_pak
  fi
done

# create project and syshoot dir if it does not exist
mkdir -p $project_dir/syshoot
cd $project_dir # cd into project dir

# download nodejs tarball if it does not exist
if [ ! -f "node-v$nodejs_version-linux-x64.tar.xz" ]; then
  echo "downloading nodejs tarball"
  wget -q --show-progress \
  https://nodejs.org/dist/v${nodejs_version}/node-v${nodejs_version}-linux-x64.tar.xz
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
locale-gen $locale
apt install --yes debconf-utils
EOF

echo "configuring locales"
cat <<EOF | chroot syshoot
echo "locales locales/locales_to_be_generated multiselect \
$locale UTF-8, en_US.UTF-8 UTF-8" | debconf-set-selections
echo "locales locales/default_environment_locale select \
$locale" | debconf-set-selections
dpkg-reconfigure --frontend noninteractive locales
EOF

echo "configuring timezones"
cat <<EOF | chroot syshoot
echo "tzdata tzdata/Zones/Etc select $etc" | debconf-set-selections
echo "tzdata tzdata/Areas select $zone" | debconf-set-selections
echo "tzdata tzdata/Zones/$zone select $city" | debconf-set-selections
dpkg-reconfigure --frontend noninteractive tzdata
EOF

echo "configuring keyboard"
# debconf-set-selections doesn't work here when it's a first install
cat <<EOF | chroot syshoot
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
# 'uname -r' to check host kernel version
# linux-image-generic
#   Depends: linux-image-5.15.0-52-generic
#   Depends: linux-modules-extra-5.15.0-52-generic # zfs module is here
#   Depends: linux-firmware
#   Depends: intel-microcode
#   Depends: amd64-microcode
#   Recommends: thermald
# chroot syshoot apt install --yes linux-image-generic

# install same kernel version as host
chroot syshoot apt install --yes linux-image-$(uname -r)
# chroot syshoot apt install --yes linux-headers-$(uname -r)
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
EOF

echo "cleaning up"
chroot syshoot apt purge --yes os-prober
chroot syshoot apt --yes update
chroot syshoot apt --purge --yes autoremove

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
tar \
-xJvf node-v${nodejs_version}-linux-x64.tar.xz \
-C syshoot/usr/bin/nodejs >/dev/null
# adding node.js binary to PATH
echo "adding node.js binary to PATH"
sed -i "s|\"$|:/usr/bin/nodejs/node-v${nodejs_version}-linux-x64/bin\"|" \
  syshoot/etc/environment

# if file config_script exist copy to syshoot/root/scripts
if [ -f "$config_script" ]; then
  echo "copy in config script"
  mkdir -p syshoot/root/scripts
  cp $config_script syshoot/root/scripts
  # create onlogin.sh and run on login
  cat <<'EOF' >syshoot/root/onlogin.sh
#!/bin/sh
. ~/scripts/network-config.sh
EOF
  chmod 0644 syshoot/root/onlogin.sh
  # insert command to run onlogin.sh at line no. 6 in .profile
  sed -i "6i\    . ~/onlogin.sh" syshoot/root/.profile
fi

# copy in hootnas webserver if source directory exists
if [ -d "$webserver" ]; then
  echo "creating directory /usr/local/hootnas"
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
ExecStart=/usr/local/hootnas/webserver/server.mjs
[Install]
WantedBy=multi-user.target
EOF

  echo "set permissions on unit file and executable"
  echo "for hootnas webserver service"
  chmod 0664 syshoot/etc/systemd/system/hootsrv.service
  chmod 0744 syshoot/usr/local/hootnas/webserver/server.mjs

  # enable hootnas webserver service
  echo "enabling hootsrv.service service"
  chroot syshoot systemctl enable systemd-networkd-wait-online.service
  chroot syshoot systemctl enable hootsrv.service
fi

# copy in webapp if source directory exists
if [ -d "$webapp" ]; then
  echo "creating directory /usr/local/hootnas"
  mkdir -p syshoot/usr/local/hootnas/webapp
  echo "copy in hootnas webapp"
  cp -r $webapp/* syshoot/usr/local/hootnas/webapp
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
