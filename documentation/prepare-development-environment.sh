#!/bin/bash

# this script will prepare your development environment by installing the 
# required dependencies e.g. node.js, debian packages, etc. it will also set 
# environment variables.
#
# usage:
#
#     sudo prepare-development-environment.sh <hootnas-repo>
#
# where <hootnas-repo> is the full path to your local hootNAS git repository
# e.g. /home/username/hootNAS
#

# get hootNAS path from user input
hootnas_repo=$1
# strip trailing slash from $hootnas_repo
hootnas_repo=${hootnas_repo%/}

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
    echo "you must run this script as root"
    user_err=1
elif [ ! "$(lsb_release -sc)" = "jammy" ]; then
    echo "this script must run on a jammy distro"
    user_err=1
elif [ ! "$(echo $hootnas_repo | cut -c1)" = "/" ]; then
    echo "the path to your local hootNAS git repository must begin in root '/'"
    user_err=1
    elif [ ! -f "$hootnas_repo/.gitignore" ] || [ -z "$hootnas_repo" ]; then
    echo "$hootnas_repo does not contain any .gitignore file"
    echo "it seems not to be a git repository"
    user_err=1
fi

if [ $user_err = 1 ]; then
    echo
    echo "usage:"
    echo
    echo "    sudo prepare-development-environment.sh <hootnas-repo>"
    echo
    echo "where <hootnas-repo> is the full path to your local hootNAS git repository"
    echo "e.g. /home/username/hootNAS"
    echo
    exit 1
fi

# adding HOOT_REPO environment variable to /etc/environment
echo HOOT_REPO=$hootnas_repo >>/etc/environment

# set optional environment variables used by build-hootos.sh:
# - HOOT_LOCALE, if not set, defaults to 'en_DE.UTF-8'
#   set your locale in the format 'en_XX.UTF-8'
#   see supported UTF-8 locales here: /usr/share/i18n/SUPPORTED
# - HOOT_XKB_LAYOUT, if not set, defaults to 'de'
#   see supported keyboard settings: /usr/share/X11/xkb/rules/evdev.lst
# - HOOT_ZONE, if not set, defaults to 'Europe'
#   setting up your local timezone and city is especially important for LDAP/AD
#   authentication. supported timezones: /usr/share/zoneinfo
# - HOOT_CITY, if not set, defaults to 'Berlin'
[ -z "$HOOT_LOCALE" ] && echo HOOT_LOCALE=en_DE.UTF-8 >>/etc/environment
[ -z "$HOOT_XKB_LAYOUT" ] && echo HOOT_XKB_LAYOUT=de >>/etc/environment
[ -z "$HOOT_ZONE" ] && echo HOOT_ZONE=Europe >>/etc/environment
[ -z "$HOOT_CITY" ] && echo HOOT_CITY=Berlin >>/etc/environment
    
# check if required packages are installed, if not - install them
deb_paks='debootstrap squashfs-tools xorriso wget'
for deb_pak in $deb_paks; do
    deb_db_status="$(dpkg-query -W --showformat='${db:Status-Status}' "$deb_pak" 2>&1)"
    if [ ! $? = 0 ] || [ ! "$deb_db_status" = installed ]; then
        apt install --yes $deb_pak
    fi
done

# install version of node.js
nodejs=v18.12.0
# check if $nodejs is installed
if [ ! "$(node -v 2>&1)" = "$nodejs" ]; then
    # download nodejs tarball if it does not exist
    if [ ! -f "/tmp/node-$nodejs-linux-x64.tar.xz" ]; then
        wget -P /tmp -q --show-progress \
            https://nodejs.org/dist/${nodejs}/node-${nodejs}-linux-x64.tar.xz
    fi
    # extract node.js
    mkdir -p /usr/bin/nodejs
    tar \
        -xJvf /tmp/node-${nodejs}-linux-x64.tar.xz \
        -C /usr/bin/nodejs >/dev/null
    # adding node.js binary to PATH
    sed -i "s|\"$|:/usr/bin/nodejs/node-${nodejs}-linux-x64/bin\"|" \
        /etc/environment
    # delete node.js tarball
    rm /tmp/node-${nodejs}-linux-x64.tar.xz
fi


