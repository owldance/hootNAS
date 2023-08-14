# live-boot

[live-boot](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) 
is a Debian maintained package that contains scripts to 
configure a live system during the boot process (early userspace). It also 
supports persistence i.e. saving changes to the live system on a persistent 
storage device. 

In addition to `live-boot`, a backend for the initrd generation is required, 
such as `live-boot-initramfs-tools`, which is a wrapper around initramfs-tools 
and contains `initramfs-tools` hooks for `live-boot`.

`live-boot` aims to be distribution agnostic, and tries to support as many 
user scenarios as possible. This is a impossible task, and therefore there 
some customization is nessesary.

Canonical has made its own fork of `live-boot` called `casper`, which is used
for their own ubuntu live distros. However `casper` lacks detailed 
documentation and is therefore not used in this project.

`live-boot` does not support zfs and zfs filesystems out-of-the-box, because 
`live-boot` uses `overlayfs` for persistence, and `overlayfs` does not support 
zfs filesystems, as the following error in the journal shows:
```
overlayfs: upper fs does not support RENAME_WHITEOUT
```

## Downloading and unpacking 
```
apt download <package-name>
dpkg-deb -R <package-name> <destination-dir>
```

## Boot sequence

When the package is installed, `/bin/live-boot` is the main script that is 
called, it iterates over all files in:
```
/etc/live/boot.conf      # not present
/etc/live/boot/*         # no files present
/lib/live/boot/????-*
```
It sources the files using the source `.` (dot) command, which executes the 
commands in the file in the current shell environment. Nothing actually gets 
executed during the sourceing of these files, only functions and some variables 
are defined.

The files in `/lib/live/boot/` are sourced in alphabetical order, so 
`0001-init-vars.sh` is sourced first, and `9990-toram-todisk.sh` is 
sourced last.

## init 

With the scripts in `/lib/live/boot/` sourced, something calls the `Live ()` 
function in `9990-main.sh` it remains unclear where and when exactly it is 
called, however with one disk and logging added to the scripts (see 
`/live-boot/src/boot-dir-original-with-debug` directory),

```
$ lsblk -e7,11 -o KNAME,TYPE,PATH,FSTYPE,MOUNTPOINT,LABEL,PARTLABEL
KNAME TYPE PATH      FSTYPE MOUNTPOINT LABEL PARTLABEL
sda   disk /dev/sda                               
sda1  part /dev/sda1 ext4              persistence                                 
```
and the following kernel parameters:
```
linux   /live/vmlinuz boot=live noeject persistence quiet splash
```
the following occurs:

```
9990-main.sh: Live
    9990-cmdline-old.sh: Cmdline_old
    0020-read-only.sh: Read_only
    9990-select-eth-device.sh: Select_eth_device 
    0030-verify-checksums: Verify_checksums 
    9990-overlay.sh: setup_unionfs
        9990-misc-helpers.sh: find_persistence_media
            9990-misc-helpers.sh: probe_for_gpt_name 
            9990-misc-helpers.sh: probe_for_fs_label
            9990-misc-helpers.sh: probe_for_file_name
                9990-misc-helpers.sh: mount_persistence_media
            ...
        9990-misc-helpers.sh: do_union
        2010-remove-persistence: Remove_persistence
        9990-misc-helpers.sh: get_custom_mounts
            9990-misc-helpers.sh: mount_persistence_media
        9990-misc-helpers.sh: activate_custom_mounts
            9990-misc-helpers.sh: do_union 
            ...
    9990-fstab.sh: Fstab
    9990-netbase.sh: Netbase
    3020-swap.sh: Swap
```

## Coustomization

This will be an ever growing list of customizations.

1. [Adding live-boot support for ZFS](/live-boot/zfs-support.md)

2. [Adding live-boot support for btrfs RAID](/live-boot/btrfs-raid-support.md)



