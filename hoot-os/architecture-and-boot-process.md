# hootOS - hootNAS architecture

The hootOS system is a indeed a complex and eclectic mix of modern and
legacy compatible technologies combined with  clever hacks to make them all 
work in unison. 

The best way to get an overview the system and the boot process is to start 
with final product, the ISO image itself.

## Anatomy of the ISO

Short summary of the output of the `gdisk -l` command:
```
Found valid GPT with protective MBR; using GPT.
Number Start (sector)  End (sector) Size       Code   Name
   1             64       1220351   595.8 MiB  0700   ISO9660
   2        1220352       1230419   4.9 MiB    EF00   EFI System Partition
```

The image has a 512 byte protective EFI GPT (type 0xEE) MBR partition that 
begins on the second sector of the disk, For convenience the MBR is a copy of 
the original ubuntu ISO image. Partition 1 is the ISO9660 filesystem and 
Partition 2 is EFI System Partition (ESP) FAT formatted.

The ESP contains the following files:
```
/
└── EFI
    └── boot
        ├── bootx64.efi
        ├── grubx64.efi
        └── mmx64.efi
```

efi files are image files created when executing `grub-install` or 
`grub-update` which then uses `grub-mkimage` to generate the image files. 
For convenience the entire partition is a copy of the original ubuntu ISO image.

The ISO9660 filesystem contains the following files:

```
/
├── boot
│   ├── grub
│   │   ├── fonts
│   │   │   └── unicode.pf2
│   │   ├── grub.cfg
│   │   ├── i386-pc
│   │   │   ├── eltorito.img
│   │   │   └── (various .mod .lst .o files)
│   │   ├── loopback.cfg
│   │   └── x86_64-efi
│   │       └── (various .mod .lst files)
│   └── memtest86+.bin
├── boot.catalog
├── .disk
│   ├── base_installable
│   ├── cd_type
│   ├── info
│   ├── live-uuid-generic
│   └── release_notes_url
├── EFI
│   └── boot
│       ├── bootx64.efi
│       ├── grubx64.efi
│       └── mmx64.efi
├── live
│   ├── filesystem.manifest
│   ├── filesystem.size
│   ├── filesystem.squashfs
│   ├── initrd
│   └── vmlinuz
├── md5sum.txt
└── ubuntu -> .
```
For convenience the `/boot` and `/EFI` directories are copies of the original 
ubuntu ISO image. 

The script `build-hootiso.sh` generates following files:
```
/boot.catalog (xorriso command)
/boot/grub/eltorito.img (xorriso command)
/boot/grub/grub.cfg
/boot/grub/loopback.cfg
/live/filesystem.manifest
/live/filesystem.size
/live/filesystem.squashfs
/live/initrd (copied from hootOS system)
/live/vmlinuz (copied from hootOS system)
/.disk/base_installable
/.disk/cd_type
/.disk/info
/.disk/live-uuid-generic
/.disk/release_notes_url
/md5sum.txt
```
The directories `ubuntu` and `.disk` is needed to make the USB Creator work 
with this custom iso image. 

The `xorriso` command in `build-hootiso.sh` also updates the partition info in 
the MBR. 

## The boot process

After the BIOS/UEFI firmware has located and selected one of the GRUB2 
bootloaders in `/EFI/boot` on the ESP, the bootloader reads one of the 
configuration files `/boot/grub/grub.cfg` or `/boot/grub/loopback.cfg` loads 
the Linux kernel (vmlinuz) into memory, turns over execution to the kernel, 
the kernel loads the initial RAM disk (initrd). 

Because the initrd is compiled (i.e. `update-initramfs`) with the 
[live-boot](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) 
package, it unpacks and loads the hootOS filesystem in 
`/live/filesystem.squashfs` into memory and create a writable environment, 
using `aufs`, to boot the system from. If `live-boot` detects a filesystem or 
partition labled `persistence`, then any changes will be persisted to that 
filesystem.

The default network configuration for hootOS is DHCP, see 
[build-syshoot.sh](./build-syshoot.sh) for details.

The script [network-config.sh](/tty/README.md) is executed on **first boot**, and
on the terminal screen, the user is welcomed with the IP address of the system. 
With this information, the user can connect to the system using SSH, or make 
webAPI calls, or open a browser and connect to the hootNAS management dashboard.

The service `hootsrv.service` starts the webserver target 
[webserver.mjs](/webserver/webserver.mjs) which in turn starts the webapp 
target [index.html](/webapp/index.html).

## Contributing

All contributors are required to sign the hootNAS Contributor License Agreement 
prior to contributing code to an open source repository. This process is 
handled automatically by [cla-assistant](https://cla-assistant.io/). 
Simply open a pull request and a bot will automatically check to see if you 
have signed the latest agreement. If not, you will be prompted to do so as part 
of the pull request process. 

This project operates under the [hootNAS Code of Conduct](#placeholder). By 
participating in this project you agree to abide by its terms. 

## Statement of Support

This software is provided as-is, without warranty of any kind or commercial 
support through hootNAS. See the associated license for additional details. 
Questions, issues, feature requests, and contributions should be directed to 
the community as outlined in the [hootNAS Community Guidelines](#placeholder).

## License

This is code is licensed under the Apache License 2.0. Full license is 
available [here](/LICENSE).

### Footnotes

[1]: live-boot does not support zfs in early userspace, therefore btrfs is used 
for persitence. As a future feature, zfs in early userspace could be
accomplished by a custom 
[initramfs hook](https://manpages.ubuntu.com/manpages/bionic/en/man8/initramfs-tools.8.html) 
or by modifying package zfs-initramfs. In either case live-boot has to be 
modified as well. Since initramfs documentation is rather abstruse, it might be 
an opportunity to move from initramfs to dracut, dracut-live and zfs-dracut.

## Placeholder

Placeholder for future content