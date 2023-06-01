/**
 * Configure zfs to import zpool on boot. This can obnly be done when 
 * persistance has been configured and system rebooted for the first time.
 * @module autoMountZpool
 * @link https://manpages.ubuntu.com/manpages/jammy/en/man8/zfs-mount-generator.8.html
 * @link https://wiki.archlinux.org/title/ZFS#Automatic_Start
 * also see ubuntu-root-on-zfs.sh for how to create a cache file
 */