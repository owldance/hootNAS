# live-boot

[live-boot](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) 
is a Debian maintained package that contains scripts to 
configure a live system during the boot process (early userspace). It also 
supports persistence i.e. saving changes to the live system on a persistent 
storage device. 

In addition to `live-boot`, a backend for the initrd generation is required, 
such as `live-boot-initramfs-tools`, which is a wrapper around initramfs-tools 
and contains `initramfs-tools` hooks for `live-boot`.

The ambition of `live-boot` is to be distribution agnostic and support as many 
use cases as possible. This is indeed an ambitious task, which is reflected 
in the code. 

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

## Repacking
```
dpkg-deb -b <source-dir> <package-name>
```
However, we do not repack the package, but instead simply overwite the 
installed original files with the modified files from this repository when 
building hootos.


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
called, however with one disk and logging added to the scripts, 

```
$ lsblk -e7,11 -o KNAME,TYPE,PATH,FSTYPE,MOUNTPOINT,LABEL,PARTLABEL
KNAME TYPE PATH      FSTYPE MOUNTPOINT LABEL PARTLABEL
sda   disk /dev/sda                               
sda1  part /dev/sda1 ext4              persistence                                 
```
and the following kernel parameters:
```
linux   /live/vmlinuz boot=live noeject persistence skipconfig quiet splash
```
where `skipconfig` skips pre-configuration of networking in 
`9990-netbase.sh: Netbase`, and fstab in `9990-fstab.sh: Fstab`, the parameter 
`noeject` is due to the known issues described further below,

Then the following occurs when `live-boot` is umodified in its original state:
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
    3020-swap.sh: Swap
```

## Customization

As the hootnas project only has one use case, it is an ideal opportunity to 
prune out redundant functionality from the original codebase, making it easier 
to read and understand. 

1. [Adding logging](/live-boot/logging-support.md)

2. [Adding support for ZFS](/live-boot/zfs-support.md)

3. [Adding support for btrfs RAID](/live-boot/btrfs-raid-support.md)

4. [Adding new (kernel) commandline parameters](/live-boot/commandline-parameters.md)

### Things up for removal
1. `find_persistence_media ()` and any functions it calls (check that) in 
    `9990-misc-helpers.sh` is not needed anymore, as 
    `find_zvol_persistence ()` is called directly from 
    `9990-overlay.sh: setup_unionfs ()` instead and it does not call any other 
    functions. 
2.  the not PLAIN_ROOT starting line 30 of `9990-overlay.sh: setup_unionfs ()` 
    is not needed, as the `PLAIN_ROOT` variable is not used.
3.  the functions `9990-netbase.sh: Netbase` and `9990-fstab.sh: Fstab` are 
    not needed, as the kernel parameters `skipconfig` is used. We have 
    no need for networking in early userspace.
4.  The function `9990-misc-helpers.sh: get_custom_mounts` 
    calls `9990-misc-helpers.sh: mount_persistence_media` reads 
    `persistence.conf` parses and verifies it, then creates file 
    `custom_mounts.list` which is then sourced by 
    `9990-misc-helpers.sh: activate_custom_mounts`.

    Instead of this, we can simply source `persistence.conf` in 
    `custom_mounts.list` format:
    ```
    custom_mounts: /tmp/custom_mounts.list
    /dev/zd0 /run/live/persistence/zd0/etc /root/etc union
    /dev/zd0 /run/live/persistence/zd0/home /root/home union
    /dev/zd0 /run/live/persistence/zd0/opt /root/opt union
    /dev/zd0 /run/live/persistence/zd0/root /root/root union
    /dev/zd0 /run/live/persistence/zd0/srv /root/srv union
    /dev/zd0 /run/live/persistence/zd0/usr /root/usr union
    /dev/zd0 /run/live/persistence/zd0/var /root/var union
    ```
    directly from 
    `9990-misc-helpers.sh: activate_custom_mounts` and do without the
    `9990-misc-helpers.sh: get_custom_mounts` function. We don't need parsing
    and verification of user input, as we have only one use case.

## Known issues

During boot and shutdown some cosmetic errors relating to mounting and 
unmounting are printed to the terminal. When `/bin/eject` is executed by 
systemd it waits for the user to eject the media and then press enter, this 
behavior is not desirable when PXE booting.

With the `noeject` kernel parameter specified, hootos will shutdown without 
ejecting the media.

This is a known issue with systemd and should have been upstream fixed jun 2023 
with version 254-rc2, see:
[https://github.com/systemd/systemd/issues/17988](https://github.com/systemd/systemd/issues/17988)
[https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=986721](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=986721)

In the meantime, ubuntu is still (aug 2023) using 
```
$ systemctl --version
systemd 249 (249.11-0ubuntu3.9)
```




