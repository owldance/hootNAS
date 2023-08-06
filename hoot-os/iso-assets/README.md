# hootOS - Extracting ubuntu ISO assets

The easiest way to create a new BIOS/UEFI bootable ISO, is to use some of the
assets from the original ubuntu ISO, the assets we need are basically those 
created by GRUB2:

1. Master Boot Record (MBR), The MBR is 512 bytes large and is located in the 
first sector of the ISO.
2. The EFI System Partition (ESP), which contains all the GRUB2 files for 
booting from UEFI firmware.
3. Directories containing the files for booting the hootOS:
- /boot
- /EFI

The script [extract-iso-assets.sh](/hoot-os//iso-assets/extract-iso-assets.sh) 
must be run in the `/hoot-os/iso-assets` directory, where it will extract above 
assets and create a tarball `iso-assets.tar.gz` of them.

```bash
$ ./extract-iso-assets.sh <originaliso>
```

where `originaliso` is the path and name of the original ubuntu iso file 
that must exist.

If the script [build-hootiso.sh](/hoot-os/build-hootiso.sh) can't find a  
`/hoot-os/iso-assets/boot` directory, it will extract the assets from the
`iso-assets.tar.gz` tarball, which ships with the hootNAS source code. 


