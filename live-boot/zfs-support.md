# Adding ZFS support for live-boot persistence

ZFS support is possible using ZVOL's (blockdevices in a zpool) with some 
minor changes to the `live-boot` scripts.

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

Update Aug 2023: The comming Version 2.2 of ZFS will improve support for Linux 
containers, with support for overlay filesystems.

## Requirements
ZFS support for `live-boot` in `initramfs` requires the following packages:
```
$ apt install --yes zfs-initramfs
```
and the following kernel parameters:
```
linux   /live/vmlinuz boot=live noeject persistence skipconfig quiet splash
```
See [live-boot - System Boot Components](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) for more details.

## Modifications to live-boot
The zfs kernel module must be loaded
```
$ modprobe zfs
```
The zpool must be imported using `-f` in case pool was previously in use from 
another system
```
$ zpool import -f dpool
```
In the original code, in `9990-overlay.sh` the function  `setup_unionfs ()` 
calls the function `find_persistence_media ()` in `9990-misc-helpers.sh`, which 
calls `probe_for_gpt_name ()` which calls `is_gpt_device ()` which checks if a 
device is a gpt device. zvols fail this check because they do not have a gpt 
partition.

The solution is modify the function `setup_unionfs ()` and subsitute 
`find_persistence_media ()` with a new function `find_zvol_persistence ()` 
which will find a zvol with filesystem `LABEL` equal to `persistence`. Because 
of this substitution, the following (kernel) commandline parameters have 
no effect:
``` 
persistence-media
persistence-method
persistence-path
persistence-storage
persistence-label
```
## clean boot log with `find_zvol_persistence ()` 

```
$ cat /run/live/boot-live.log 
9990-main.sh: Live BEGIN
    9990-cmdline-old.sh: Cmdline_old BEGIN
        live_boot_cmdline: BOOT_IMAGE=/live/vmlinuz boot=live persistence noeject skipconfig quiet splash
        PERSISTENCE: true
        NOFSTAB: true
        NONETWORKING: true
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
        Scan local devices for the image:/run/live/medium
    0030-verify-checksums: Verify_checksums BEGIN
    0030-verify-checksums: Verify_checksums END
    9990-misc-helpers.sh: mount_images_in_directory BEGIN
        directory: /run/live/medium
        rootmnt: /root
        mac: 5254001218DE
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
            9990-misc-helpers.sh: find_zvol_persistence BEGIN
                overlays: persistence white_listed_devices: 
                live-boot: we need zfs at this point
                found zvol /dev/zd0 with label persistence
            9990-misc-helpers.sh: find_zvol_persistence END
            overlay_devices:  /dev/zd0
            9990-misc-helpers.sh: do_union BEGIN
                unionmountpoint: /root
                unionrw: /run/live/overlay
                unionro: /run/live/rootfs/filesystem.squashfs/
                mount -t overlay -o noatime,lowerdir=/run/live/rootfs/filesystem.squashfs/,upperdir=/run/live/overlay/rw,workdir=/run/live/overlay/work overlay /root
            9990-misc-helpers.sh: do_union END
            2010-remove-persistence: Remove_persistence BEGIN
            2010-remove-persistence: Remove_persistence END
            Correcting the permission of /tmp
            Correcting the permission of /var/tmp
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
                source: /usr
                source: /var
                source: /home
                source: /root
                source: /srv
                source: /opt
            9990-misc-helpers.sh: get_custom_mounts END
            copying custom_mounts.list to /run/live for your debuging pleasure
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
            used_overlays: /dev/zd0
        9990-overlay.sh: setup_unionfs END
    9990-misc-helpers.sh: mount_images_in_directory END
    9990-fstab.sh: Fstab BEGIN
    9990-fstab.sh: Fstab END
    9990-netbase.sh: Netbase BEGIN
    9990-netbase.sh: Netbase END
    3020-swap.sh: Swap BEGIN
    3020-swap.sh: Swap END
    copying mounts to /run/live for your debuging pleasure
9990-main.sh: Live END
```
