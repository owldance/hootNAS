# hootNAS - webapi

The webapi consists of js modules containing methods which can be called by the 
webserver. 

@todo make methods callable from the command line

@todo in [initialSetup.mjs](blockdevices/initialSetup.mjs) btrfs raid for 
persistance partitions is broken since kernel 5.19.0-42 with btrfs-progs v5.16.2. 

on mount, the kernel will complain about missing devices, because the udev 
rules calls 'btrfs device scan' which scans for devices in /dev/disk/by-uuid 
which udev do not create consistently.

see man pages for mkfs.btrfs, udev and btrfs-device

