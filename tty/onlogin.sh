#!/bin/bash

# check if file /etc/zfs/zpool.cache exists, this file is created by zfs when
# a zpool is imported for the first time. If it does not exist, run the
# network-config.sh script to configure the network and import the zpool.
if [ ! -f /etc/zfs/zpool.cache ]; then
    # try to import the zpool named 'dpool'. the 'dpool' is created by the
    # user in the webapp. see file /webapi/blockdevices/initialSetup.mjs
    zpool import dpool
    if [ $? -eq 0 ]; then
        # zpool is now imported, this must be first boot after user setup
        # remove line 6 in the file /root/.profile to prevent this script
        # from running again.
        sed -i '6d' /root/.profile
        # remove root auto login from /lib/systemd/system/getty@.service
        sed -i "s|ExecStart.*|ExecStart=-/sbin/agetty -o '-p -- \\\\u' --noclear %I \$TERM|g" \
            /lib/systemd/system/getty@.service
    else
        /root/scripts/network-config.sh
    fi
fi
