# hootNAS - architecture

## Summary
hootOS is a linux distro based on the latest ubuntu LTS.

hootOS is packaged as a BIOS/UEFI bootable ISO hybrid and runs entirely 
in-memory, and can optionally persist system changes to writable media. 
The advantage of such a system is that: 

* no installation is required
* simple and easy to upgrade
* boot from any media, even a slow USB-stick, or network
* True data and system OS separation 

## Compatability with Debian

hootOS is based on the latest ubuntu LTS, but could be ported to Debian without 
much effort, the main thing to consider is the version of the `live-boot` 
package, as ubuntu lags considerably behind Debian in this regard and the 
package has been 
[customized to support ZFS persistent storage](/live-boot/README.md) in `initrd` 
and some other improvements.

## What is hootNAS?
hootNAS is basically everything in this repository, it is packaged as a
bootable ISO image that contains hootOS with its constituent parts, represented 
herebelow in a heriarchy.

```
hootNAS
└── hootISO
    └── hootOS
        ├── live-boot
        ├── scripts
        ├── webapp
        ├── webapi
        └── webserver
```

The hootNAS system is a resonably complex and eclectic mix of modern and
legacy compatible technologies combined with clever hacks to make them all 
work in unison. 

The best way to get an overview the system and the boot process is to start 
with final product, the ISO image itself.

## Anatomy of the ISO
Short summary of the output of the `gdisk -l` command:
```
Found valid GPT with protective MBR; using GPT.
Part   Start (sector)  End (sector) Size       Code   Name
   1             64       1220351   595.8 MiB  0700   ISO9660
   2        1220352       1230419   4.9 MiB    EF00   EFI System Partition
```

### Sector 1
Sector 1 (not shown above) is 512 byte and contains a hybrid protective 
EFI GPT (type 0xEE) MBR partition. For convenience the MBR is 
[extracted from the original ubuntu ISO file](/hoot-os/assets/README.md)

### Partition 1
Partition 1 is the ISO9660 filesystem which contains the following files:
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
For convenience the `/boot` and `/EFI` directories are 
[extracted from the original ubuntu ISO file](/hoot-os/assets/README.md)

The script [build-hootiso.sh](/hoot-os/build-hootiso.sh) generates following 
files:
```
/boot.catalog 
/boot/grub/grub.cfg
/boot/grub/loopback.cfg
/live/filesystem.manifest
/live/filesystem.size
/live/filesystem.squashfs
/.disk/base_installable
/.disk/cd_type
/.disk/info
/.disk/live-uuid-generic
/.disk/release_notes_url
/md5sum.txt
```
The directories `ubuntu` and `.disk` and its files are needed to make the USB 
Creator work with this custom iso image. 

The files `/live/initrd` and `/live/vmlinuz` are copied from the hootOS 
system by [build-hootiso.sh](/hoot-os/build-hootiso.sh) and are the
linux kernel and initial RAM disk used to boot the system.

### Partition 2
Partition 2 is EFI System Partition (ESP) which is FAT formatted and contains 
the following files:
```
/
└── EFI
    └── boot
        ├── bootx64.efi
        ├── grubx64.efi
        └── mmx64.efi
```

For convenience the entire partition is 
[extracted from the original ubuntu ISO file](/hoot-os/assets/README.md)

## The boot process
After the BIOS/UEFI firmware has located and selected one of the GRUB2 
bootloaders in `/EFI/boot` on the ESP, the bootloader reads one of the 
configuration files `/boot/grub/grub.cfg` or `/boot/grub/loopback.cfg` loads 
the Linux kernel `/live/vmlinuz` into memory, turns over execution to the 
kernel which loads the initial RAM disk `/live/initrd`. 

Because the initrd is compiled (i.e. `update-initramfs` is executed) with the 
[live-boot](/live-boot/README.md) package, scripts in `initrd` unpacks and 
loads the squashed hootOS filesystem in `/live/filesystem.squashfs` into memory 
and create a writable environment, using `tmpfs`, to boot the system from. If 
`initrd` scripts detects a partition labled `persistence`, then any changes 
will be persisted to that partition using `overlayfs`.

The default network configuration for hootOS is DHCP, see 
[build-hootos.sh](/hoot-os/build-hootos.sh) for details.

The script [tui-network-config.sh](/scripts/tui-network-config.sh) is executed 
on first boot, 
and on the terminal screen, the user is welcomed with the IP address of the 
system. With this information, the user can connect to the system using SSH, 
or make webAPI calls, or open a browser and connect to the hootNAS management 
dashboard.

The service `hootsrv.service` (see [build-hootos.sh](/hoot-os/build-hootos.sh)) 
starts the webserver target [webserver.mjs](/webserver/webserver.mjs).

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

## Placeholder

Placeholder for future content