# hootOS - Assets


## Extracting ubuntu ISO assets

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

The script [extract-iso-assets.sh](/hoot-os/assets/extract-iso-assets.sh) 
must be run in the `/hoot-os/assets` directory, where it will extract above 
assets and create a tarball `iso-assets.tar.gz` of them. If the tarball already
exists, you don't need to run the script.

```bash
$ ./extract-iso-assets.sh <originaliso>
```

where `originaliso` is the path and name of the original ubuntu iso file 
that must exist.

If the script [build-hootiso.sh](/hoot-os/build-hootiso.sh) can't find a 
`/hoot-os/assets/boot` directory, it will extract the assets from the
`iso-assets.tar.gz` tarball, which is already included in this repository, 
you don't need to download anyting.

## Downloading i915 firmware

firmware required by `live-boot` when building hootos with parameter 
`build=virtual`. If not present, `update-initramfs` will complain about the
missing firmware, which is not a problem, but it is annoying. 

The script

```bash
$ ./download-i915-firmware.sh 
```

downloads the drivers listed in `missing-firmware.txt` and adds them to the 
`i915-firmware.tar.gz` tarball, which is already included in this repository, 
you don't need to download anyting.


