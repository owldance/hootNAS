#!/bin/bash
#
# This script is executed during the first boot when root is automatically
# logged in and the user is expected to setup the storagepool via the webapp.
#
# First time the script runs it tries to import the storagepool, which fails
# because it doesn't exist yet, then executes `netowrk-config.sh`.
#
# Second time the script runs it tries to import the storagepool again, this
# time it succeeds and the cache file `/etc/zfs/zpool.cache` is created, and the
# `zfs-import-cache.service` can import the storagepool on all subsequent boots,
# because now `live-boot` persistancy is active. The script also removes root
# auto login and prevent itself from running again.

# check if zpool has been created by user
# zpool import dpool
#if [ $? -eq 0 ]; then
    # zpool is now imported, `/etc/zfs/zpool.cache` is created and is
    # persistent.
    # remove line 6 in the file /root/.profile to prevent this script
    # from running again.
    #sed -i '6d' /root/.profile
    # remove root auto login from /lib/systemd/system/getty@.service
    #sed -i "s|ExecStart.*|ExecStart=-/sbin/agetty -o '-p -- \\\\u' --noclear %I \$TERM|g" \
    #    /lib/systemd/system/getty@.service
#else
    #/root/scripts/network-config.sh
#fi
