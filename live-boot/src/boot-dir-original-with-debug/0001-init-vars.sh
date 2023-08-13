#!/bin/sh

mountpoint="/run/live/medium"
alt_mountpoint="/media"
LIVE_MEDIA_PATH="live"
HOSTNAME="host"
custom_overlay_label="persistence"
persistence_list="persistence.conf"

mkdir -p "${mountpoint}"
mkdir -p /var/lib/live/boot

# the device node /dev/btrfs-control is missing. this is usually set up by udev
echo $(mknod /dev/btrfs-control c 10 234 2>&1) >> /run/live/boot-live.log
# echo $(modprobe btrfs 2>&1) >> /run/live/boot-live.log
# echo $(btrfs device scan 2>&1) >> /run/live/boot-live.log


