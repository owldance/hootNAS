# hootOS - ubuntu ISO assets for booting hootOS

The easiest way to create a new BIOS/UEFI bootable ISO, is to use some of the
assets from the original ubuntu ISO, the assets we need are basically those 
created by GRUB2:

1. Master Boot Record (MBR), The MBR is 512 bytes large and is located in the 
first sector of the disk.
2. The EFI System Partition (ESP), which contains all the GRUB2 files for 
booting from UEFI firmware.
3. Directories containing the files for booting the hootOS:
- /boot
- /EFI

The script [extract-assets-from-iso.sh](./extract-iso-assets.sh) will extract
these assets to the `/hoot-os/iso-assets` directory, it will also create a 
tarball `iso-assets.tar.gz` of the extracted assets, which is used by the 
[build-hootiso.sh](../build-hootiso.sh) script to create the new ISO. 
Extracting the assets is a one-time operation, and there is no need for 
the devloper to download the original iso file if the tarball is present.

Usage:

```bash
     extract-assets-from-iso.sh <originaliso>
```

 where `originaliso` is the path and name of the original ubuntu iso file 
 that must exist.

