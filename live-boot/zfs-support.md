# Adding ZFS support for live-boot persistence

ZFS support is possible using ZVOL's (blockdevices in a zpool) with some 
major changes to the `live-boot` scripts.

As noted previously `live-boot` does not support zfs and zfs filesystems 
out-of-the-box, because `live-boot` uses `overlayfs` for persistence, and 
`overlayfs` does not support zfs filesystems, as the following error in the 
journal shows:
```
overlayfs: upper fs does not support RENAME_WHITEOUT
```
Therefore the solution is to use zfs zvols for persistence, and not zfs 
filesystems, then make a filesystem on the zvol that is supported by 
`overlayfs` e.g. `ext4`.

## Requirements
ZFS support for `live-boot` in `initramfs` requires the following packages:
```
$ apt install --yes zfs-initramfs
```
and the following kernel parameters:
```
linux   /live/vmlinuz boot=live noeject persistence quiet splash
```
See [live-boot - System Boot Components](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) for more details.

## Modifications to live-boot
The zfs kernel module must be loaded
```
$ modprobe zfs
```
The zpool must be imported
```
$ zpool import dpool
```
In `9990-misc-helpers.sh`  the function `find_persistence_media ()` calls 
`probe_for_gpt_name ()` which calls `is_gpt_device ()` which checks if a device 
is a gpt device, zvols fail this check because they do not have a gpt partition.

The solution is modify the function `find_persistence_media ()`, have it 
find the zvol with `LABEL` equal to `persistence`, for the hootnas application 
we expect only one zvol with such label, if found, then skip the rest of the 
function. This way we also avoid that the function mounts further volumes and 
zvols to check for persistence files, when using default value (i.e. 
`file,filesystem` when not set) for kernel parameter `persistence-storage`. 



blkid -s LABEL -o value /dev/zd0 


## with zfs zvol

9990-main.sh: Live BEGIN
9990-cmdline-old.sh: Cmdline_old BEGIN
    live_boot_cmdline: BOOT_IMAGE=/live/vmlinuz boot=live noeject persistence quiet splash
    PERSISTENCE: true
    NETBOOT=
    MODULE=filesystem
    UNIONTYPE=overlay
    PERSISTENCE_ENCRYPTION=none
    PERSISTENCE_METHOD=overlay
    PERSISTENCE_STORAGE=filesystem,file
9990-cmdline-old.sh: Cmdline_old END
0020-read-only.sh: Read_only BEGIN
0020-read-only.sh: Read_only END
9990-select-eth-device.sh: Select_eth_device BEGIN
    Not a net boot : nothing to do
9990-select-eth-device.sh: Select_eth_device END
0030-verify-checksums: Verify_checksums BEGIN
0030-verify-checksums: Verify_checksums END
9990-overlay.sh: setup_unionfs BEGIN
    image_directory=/run/live/medium/live
    rootmnt=/root
    addimage_directory=/run/live/medium/live/5254001218DE
    UNIONTYPE=overlay
    Mounting the read-only file systems first
    PLAIN_ROOT=
    not PLAIN_ROOT
    Mounting /run/live/medium/live/filesystem.squashfs on /run/live/rootfs/filesystem.squashfs via /dev/loop0
    Done mounting the read-only file systems
    PERISTENCE=true
    NOPERSISTENCE=
    Loading USB modules
    Looking for persistence media
9990-misc-helpers.sh: find_persistence_media BEGIN
    overlays: persistence white_listed_devices: 
    zpool import: 
    zfs list: NAME            USED  AVAIL     REFER  MOUNTPOINT
dpool          1.03G  2.59G       96K  /dpool
dpool/hootnas  1.03G  3.58G     48.9M  -
    ls /dev/zvol: ls: /dev/zvol: No such file or directory
    ls /dev/zd*: /dev/zd0
    blkid: /dev/sr0: BLOCK_SIZE="2048" UUID="2023-02-23-04-13-44-00" LABEL="HOOTNAS_22_04_2" TYPE="iso9660" PTTYPE="PMBR"
/dev/loop0: TYPE="squashfs"
/dev/sda1: LABEL="dpool" UUID="9480873778270881037" UUID_SUB="2853057586373339989" BLOCK_SIZE="4096" TYPE="zfs_member" PARTUUID="cdb888d5-26bf-4cb2-9dcc-ce3c73a51121"
/dev/zd0: LABEL="persistence" UUID="e9b22836-abd9-49be-9e25-1223bbcdd670" BLOCK_SIZE="4096" TYPE="ext4"
    black_listed_devices:    
    checking device /dev/sda1
    checking device /dev/sda1 for GPT partition names or filesystem labels
    PERSISTENCE_STORAGE: filesystem,file
    checking for GPT partition names
9990-misc-helpers.sh: probe_for_gpt_name BEGIN
    overlays: persistence
    dev: /dev/sda1
9990-misc-helpers.sh: probe_for_gpt_name END
    checking device for filesystem labels
9990-misc-helpers.sh: probe_for_fs_label BEGIN
9990-misc-helpers.sh: probe_for_fs_label END
    checking device for files with matching name on mounted partition
9990-misc-helpers.sh: probe_for_file_name BEGIN
    overlays: persistence dev: /dev/sda1
9990-misc-helpers.sh: mount_persistence_media BEGIN
    device: /dev/sda1 probe: probe
    backing: /run/live/persistence/sda1
    old_backing: 
    mount -t 'zfs_member' -o 'rw,noatime' '/dev/sda1' '/run/live/persistence/sda1'
    Failed to mount persistence media /dev/sda1 : mount: mounting /dev/sda1 on /run/live/persistence/sda1 failed: No such device
9990-misc-helpers.sh: mount_persistence_media END
    backing: 
9990-misc-helpers.sh: probe_for_file_name END
    checking device /dev/sda
    checking device /dev/sda for GPT partition names or filesystem labels
    PERSISTENCE_STORAGE: filesystem,file
    checking for GPT partition names
9990-misc-helpers.sh: probe_for_gpt_name BEGIN
    overlays: persistence
    dev: /dev/sda
    /dev/sda is not a GPT device
9990-misc-helpers.sh: probe_for_gpt_name END
    checking device for filesystem labels
9990-misc-helpers.sh: probe_for_fs_label BEGIN
9990-misc-helpers.sh: probe_for_fs_label END
    checking device for files with matching name on mounted partition
9990-misc-helpers.sh: probe_for_file_name BEGIN
    overlays: persistence dev: /dev/sda
9990-misc-helpers.sh: mount_persistence_media BEGIN
    device: /dev/sda probe: probe
    backing: /run/live/persistence/sda
    old_backing: 
    mount -t '' -o 'rw,noatime' '/dev/sda' '/run/live/persistence/sda'
    Failed to mount persistence media /dev/sda : mount: mounting /dev/sda on /run/live/persistence/sda failed: No such device
9990-misc-helpers.sh: mount_persistence_media END
    backing: 
9990-misc-helpers.sh: probe_for_file_name END
    checking device /dev/sr0
    checking device /dev/sr0 for GPT partition names or filesystem labels
    PERSISTENCE_STORAGE: filesystem,file
    checking for GPT partition names
9990-misc-helpers.sh: probe_for_gpt_name BEGIN
    overlays: persistence
    dev: /dev/sr0
    /dev/sr0 is not a GPT device
9990-misc-helpers.sh: probe_for_gpt_name END
    checking device for filesystem labels
9990-misc-helpers.sh: probe_for_fs_label BEGIN
9990-misc-helpers.sh: probe_for_fs_label END
    checking device for files with matching name on mounted partition
9990-misc-helpers.sh: probe_for_file_name BEGIN
    overlays: persistence dev: /dev/sr0
9990-misc-helpers.sh: mount_persistence_media BEGIN
    device: /dev/sr0 probe: probe
    backing: /run/live/persistence/sr0
    old_backing: /run/live/medium
9990-misc-helpers.sh: mount_persistence_media END
    backing: /run/live/persistence/sr0
    unmounting and removing /run/live/persistence/sr0
9990-misc-helpers.sh: probe_for_file_name END
    checking device /dev/zd0
    checking device /dev/zd0 for GPT partition names or filesystem labels
    PERSISTENCE_STORAGE: filesystem,file
    checking for GPT partition names
9990-misc-helpers.sh: probe_for_gpt_name BEGIN
    overlays: persistence
    dev: /dev/zd0
9990-misc-helpers.sh: probe_for_gpt_name END
    checking device for filesystem labels
9990-misc-helpers.sh: probe_for_fs_label BEGIN
9990-misc-helpers.sh: probe_for_fs_label END
    its got filesystem lable:  persistence=/dev/zd0
9990-misc-helpers.sh: find_persistence_media END
    overlay_devices:  /dev/zd0
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root
    unionrw: /run/live/overlay
    unionro: /run/live/rootfs/filesystem.squashfs/
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs/,upperdir=/run/live/overlay/rw,workdir=/run/live/overlay/work overlay /root
9990-misc-helpers.sh: do_union END
2010-remove-persistence: Remove_persistence BEGIN
2010-remove-persistence: Remove_persistence END
    Adding custom persistence
9990-misc-helpers.sh: get_custom_mounts BEGIN
    devices: /dev/zd0
    custom_mounts: /tmp/custom_mounts.list
9990-misc-helpers.sh: mount_persistence_media BEGIN
    device: /dev/zd0 probe: 
    backing: /run/live/persistence/zd0
    old_backing: 
    mount -t 'ext4' -o 'rw,noatime' '/dev/zd0' '/run/live/persistence/zd0'
9990-misc-helpers.sh: mount_persistence_media END
    backing: /run/live/persistence/zd0
    include_list: /run/live/persistence/zd0/persistence.conf
    source: /etc
    Skipping unsafe custom mount /lib
    source: /usr
    source: /var
    source: /home
    source: /root
    source: /srv
    source: /opt
9990-misc-helpers.sh: get_custom_mounts END
9990-misc-helpers.sh: activate_custom_mounts BEGIN
    custom_mounts: /tmp/custom_mounts.list
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/etc
    unionrw: /run/live/persistence/zd0/etc
    unionro: /run/live/rootfs/filesystem.squashfs//etc
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//etc,upperdir=/run/live/persistence/zd0/etc/rw,workdir=/run/live/persistence/zd0/etc/work overlay /root/etc
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/home
    unionrw: /run/live/persistence/zd0/home
    unionro: /run/live/rootfs/filesystem.squashfs//home
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//home,upperdir=/run/live/persistence/zd0/home/rw,workdir=/run/live/persistence/zd0/home/work overlay /root/home
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/opt
    unionrw: /run/live/persistence/zd0/opt
    unionro: /run/live/rootfs/filesystem.squashfs//opt
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//opt,upperdir=/run/live/persistence/zd0/opt/rw,workdir=/run/live/persistence/zd0/opt/work overlay /root/opt
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/root
    unionrw: /run/live/persistence/zd0/root
    unionro: /run/live/rootfs/filesystem.squashfs//root
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//root,upperdir=/run/live/persistence/zd0/root/rw,workdir=/run/live/persistence/zd0/root/work overlay /root/root
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/srv
    unionrw: /run/live/persistence/zd0/srv
    unionro: /run/live/rootfs/filesystem.squashfs//srv
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//srv,upperdir=/run/live/persistence/zd0/srv/rw,workdir=/run/live/persistence/zd0/srv/work overlay /root/srv
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/usr
    unionrw: /run/live/persistence/zd0/usr
    unionro: /run/live/rootfs/filesystem.squashfs//usr
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//usr,upperdir=/run/live/persistence/zd0/usr/rw,workdir=/run/live/persistence/zd0/usr/work overlay /root/usr
9990-misc-helpers.sh: do_union END
9990-misc-helpers.sh: do_union BEGIN
    unionmountpoint: /root/var
    unionrw: /run/live/persistence/zd0/var
    unionro: /run/live/rootfs/filesystem.squashfs//var
    mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs//var,upperdir=/run/live/persistence/zd0/var/rw,workdir=/run/live/persistence/zd0/var/work overlay /root/var
9990-misc-helpers.sh: do_union END
    used_devices:  /dev/zd0
9990-misc-helpers.sh: activate_custom_mounts END
9990-overlay.sh: setup_unionfs END
    mount_images_in_directory /run/live/medium /root 5254001218DE
9990-fstab.sh: Fstab BEGIN
    adding overlay / overlay rw 0 0 to /root/etc/fstab
    tmpfs /tmp tmpfs nosuid,nodev 0 0
9990-fstab.sh: Fstab END
9990-netbase.sh: Netbase BEGIN
9990-netbase.sh: Netbase END
3020-swap.sh: Swap BEGIN
3020-swap.sh: Swap END
9990-main.sh: Live END



