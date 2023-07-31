# Using btrfs RAID1 for live-boot persistence 

Using btrfs RAID1 for live-boot persistence is very convenient, because btrfs 
supports RAID1 creation and management out-of-the-box, and mounting a btrfs 
raid is as simple as mounting a single btrfs device in the raid, which means 
that `live-boot` does not need to be modified fundamentally to support btrfs raid.

CAVEAT: If there are multiple raid devices with a partition labeled 
"persistence", `live-boot` will try to mount them all and the raid will not 
mount correctly, therefore only one partition label "persistence" is allowed in 
a raid.

The raid configuration is done by `/webapi/blockdevices/initialSetup.mjs`

The only modification done to `live-boot` is to add the command
`mknod /dev/btrfs-control c 10 234` to `/etc/live/boot/0001-init-vars.sh` 
which will create a missing udev node that enables the kernel to recognize
a btrfs raid.

The following is a description of the debugging process that led to this
modification.

### Examining the boot process

Adding the kernel parameters `udev.log_priority=debug` and 
`systemd.log_level=debug` in the `grub.cfg` file, then examining the log with 
the command `journalctl -b -xg "btrfs|live"` did not reveal anything useful, 
except this type of confusing log entries:
```
BTRFS error (device sdb1): devid 3 uuid ab25c57d-9eab-48ca-b5fe-f5c8cd9bf348 is missing
BTRFS error (device sdb1): failed to read the system array: -2
BTRFS error (device sdb1): open_ctree failed
```

### Debugging in early userspace

`live-boot` does accept a commandline parameter `debug`, but it's of very 
limited use. The scripts use LSB init script functions e.g. 
`log_warning_msg` and `log_failure_msg`, and it us unclear where the output
of these functions end up.

There are two alternative options for debugging `live-boot` or any other script:

1. Writing to the kernel log using
```
    echo "<7>whatever: A message from early userspace" > /dev/kmsg
```
Where the number in the angle brackets is the kernel log level. This produces 
perfectly formatted kernel log messages with a timestamp, that are available 
in `journald` and `dmesg`.

2. Writing to a file in the `/run` directory, e.g. `/run/live` 
```
    echo "A message from early userspace" >> /run/live/boot-live.log
```
This allows for large amounts of data to be logged.

### Problem identification

According to the `live-boot` source code, when the `/bin/live-boot` script 
is executed during boot, it executes all the scripts in the `/etc/live/boot/` 
directory. One of theses scripts `/etc/live/boot/9990-misc-helpers.sh` 
contains a function `mount_persistence_media` which is responsible for 
mounting the persistence device(s).

Adding appropriate logging to the `mount` commands in the function 
`mount_persistence_media`, it produces the error message 
`mount: mounting /dev/sda1 on /run/live/persistence/sda1 failed: Invalid argument` 
which is not very helpful. However it only occurs on devices that are part of a 
btrfs raid, and not on btrfs devices that are not part of a raid, which means 
that btrfs kernel moduels are loaded correctly, but the kernel is unable to
recognize the btrfs raid.

Before mounting a btrfs raid, it was customary to execute 
`btrfs device scan` first, a userspace tool that scans all block devices, 
looks for a btrfs superblock, and updates the kernel. Adding this command to 
the `/etc/live/boot/0001-init-vars.sh` script, it produces the error message 
`btrfs: failed to open /dev/btrfs-control skipping device registration`.

The udev node `/dev/btrfs-control` does not exist and should have been created 
by the `udev` daemon, but it is not, at least not at this point in the boot 
process where it is needed.  

### Problem resolving

Adding the command `mknod /dev/btrfs-control c 10 234` to 
`/etc/live/boot/0001-init-vars.sh` will create the missing udev node, and 
the btrfs raid can now be mounted in early userspace. The command 
`btrfs device scan` is no longer needed, and can be removed.

References:

[https://elinux.org/Debugging_by_printing](https://elinux.org/Debugging_by_printing)

[https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html](https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html)
