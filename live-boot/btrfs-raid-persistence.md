# Using btrfs RAID1 for live-boot persistence 

Using btrfs RAID1 for live-boot persistence is very convenient, because btrfs 
supports RAID1 creation and management out-of-the-box, and mounting a btrfs 
raid is as simple as mounting a single btrfs device in the raid, which means 
that `live-boot` does not need to be modified to support btrfs raid.

CAVEAT: If there are multiple raid devices with a partition labeled 
"persistence", `live-boot` will try to mount them all and the raid will not 
mount correctly, therefore only one partition label "persistence" is allowed in 
a raid.

This setup worked for a while until it suddently didn't any more, 
unfortunately it is not preciesly known when and why it stopped working.

The core issue is now that that the raid is not able to mount in early 
userspace.

The following is a log of the steps taken to create the raid and the debugging 
process to identify and resolve the problem.


<details>
<summary>Partitioning all devices</summary>

```
for disk in $(ls /dev/disk/by-id/scsi*); do
    sgdisk -n1:1M:+2G -t1:8300 $disk # linux filesystem
    sgdisk -c1:persistence $disk 
    sgdisk -n2:0:0 -t2:BF01 $disk # Solaris /usr & Mac ZFS
done
```
</details>

<details>
<summary>Available devices after partitioning</summary>

```
$ ls -l /dev/disk/by-id/
total 0
lrwxrwxrwx 1 root root  9 Jun 18 14:36 ata-QEMU_DVD-ROM_QM00001 -> ../../sr0
lrwxrwxrwx 1 root root  9 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1 -> ../../sdc
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part1 -> ../../sdc1
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part2 -> ../../sdc2
lrwxrwxrwx 1 root root  9 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2 -> ../../sdb
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2-part1 -> ../../sdb1
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2-part2 -> ../../sdb2
lrwxrwxrwx 1 root root  9 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3 -> ../../sda
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3-part1 -> ../../sda1
lrwxrwxrwx 1 root root 10 Jun 18 15:10 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3-part2 -> ../../sda2
```
</details>

<details>
<summary>Creating the raid1 using the first partition on all devices</summary>

```
$ mkfs.btrfs -L persistence -d raid1 -m raid1 -f /dev/disk/by-id/*-part1
btrfs-progs v5.16.2
See http://btrfs.wiki.kernel.org for more information.

Performing full device TRIM /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part1 (2.00GiB) ...
NOTE: several default settings have changed in version 5.15, please make sure
      this does not affect your deployments:
      - DUP for metadata (-m dup)
      - enabled no-holes (-O no-holes)
      - enabled free-space-tree (-R free-space-tree)

Performing full device TRIM /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2-part1 (2.00GiB) ...
Performing full device TRIM /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3-part1 (2.00GiB) ...
Label:              persistence
UUID:               96cbd99c-a864-4190-8a84-b2d0c43a051b
Node size:          16384
Sector size:        4096
Filesystem size:    6.00GiB
Block group profiles:
  Data:             RAID1           307.19MiB
  Metadata:         RAID1           256.00MiB
  System:           RAID1             8.00MiB
SSD detected:       no
Zoned device:       no
Incompat features:  extref, skinny-metadata, no-holes
Runtime features:   free-space-tree
Checksum:           crc32c
Number of devices:  3
Devices:
   ID        SIZE  PATH
    1     2.00GiB  /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part1
    2     2.00GiB  /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2-part1
    3     2.00GiB  /dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3-part1


```
</details>

<details>
<summary>The raid can successfully be mounted in userspace and a file can be written to it
</summary>

```
mount $disk1-part1 /mnt 
echo '/etc union' > /mnt/persistence.conf
echo '/lib union' >> /mnt/persistence.conf
echo '/usr union' >> /mnt/persistence.conf
echo '/var union' >> /mnt/persistence.conf
echo '/home union' >> /mnt/persistence.conf
echo '/root union' >> /mnt/persistence.conf
echo '/srv union' >> /mnt/persistence.conf
echo '/opt union' >> /mnt/persistence.conf
mkdir -p /mnt/root/rw
echo 'BFA7824' > /mnt/root/rw/setup.id
chmod 700 /mnt/root
umount /mnt
reboot
```
</details>

### System is rebooted 

However the btrfs raid does not mount, and the boot process continues. The 
btrfs raid can be mounted manually in userspace, without any problems. A single 
btrfs device i.e. not part of a raid, can be mounted without any problems as 
well.

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
