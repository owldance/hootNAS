#!/bin/bash

# usage:
#
#     sudo getting-started.sh
#
# This script will prepare your development environment by installing the 
# required dependencies e.g. node.js, npm packages, debian packages, etc. 
# it will also set optional environment variables.

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
    echo "you must run this script as root"
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
    exit 1
fi

# set optional environment variables used by build-syshoot.sh:
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
if [ -z "$HOOT_LOCALE" ]; then
    echo HOOT_LOCALE=en_DE.UTF-8 >>/etc/environment
fi
if [ -z "$HOOT_XKB_LAYOUT" ]; then
    echo HOOT_XKB_LAYOUT=de >>/etc/environment
fi
if [ -z "$HOOT_ZONE" ]; then
    echo HOOT_ZONE=Europe >>/etc/environment
fi
if [ -z "$HOOT_CITY" ]; then
    echo HOOT_CITY=Berlin >>/etc/environment
fi

# check if required packages are installed, if not - install them
deb_paks='debootstrap squashfs-tools xorriso'
for deb_pak in $deb_paks; do
    deb_db_status="$(dpkg-query -W --showformat='${db:Status-Status}' "$deb_pak" 2>&1)"
    if [ ! $? = 0 ] || [ ! "$deb_db_status" = installed ]; then
        apt install --yes $deb_pak
    fi
done

# install node.js
nodejs_version=v18.12.0

# check if node.js $nodejs_version is installed
if [ ! "$(node -v 2>&1)" = "$nodejs_version" ]; then
    # download nodejs tarball if it does not exist
    if [ ! -f "/tmp/node-$nodejs_version-linux-x64.tar.xz" ]; then
        wget -P /tmp -q --show-progress \
            https://nodejs.org/dist/${nodejs_version}/node-${nodejs_version}-linux-x64.tar.xz
    fi
    # extract node.js
    mkdir -p /usr/bin/nodejs
    tar \
        -xJvf /tmp/node-${nodejs_version}-linux-x64.tar.xz \
        -C /usr/bin/nodejs >/dev/null
    # adding node.js binary to PATH
    sed -i "s|\"$|:/usr/bin/nodejs/node-${nodejs_version}-linux-x64/bin\"|" \
        /etc/environment
    # delete node.js tarball
    rm /tmp/node-${nodejs_version}-linux-x64.tar.xz
fi

# install npm packages
cd $HOOT_REPO/webserver
npm install
cd $HOOT_REPO/webapp
npm install
cd $HOOT_REPO/webapi
npm install
