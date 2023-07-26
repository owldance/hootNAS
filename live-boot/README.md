# live-boot

`live-boot` is a Debian maintained package that contains scripts to 
configure a live system during the boot process (early userspace). It also 
supports persistence i.e. saving changes to the live system on a persistent 
storage device. 

In addition to `live-boot`, a backend for the initrd generation is required, 
such as `live-boot-initramfs-tools`, which is a wrapper around initramfs-tools 
and contains `initramfs-tools` hooks for `live-boot`.

`live-boot` aims to be distribution agnostic, and tries to support as many 
user scenarios as possible. This is a impossible task, and therefore there 
some customization is nessesary.

## Downloading and unpacking 
```
apt download <package-name>
dpkg-deb -R <package-name> <destination-dir>
```

## Coustomization

This will be an ever growing list of customizations.

1. [Using btrfs RAID1 for live-boot persistence](/live-boot/btrfs-raid-persistence.md)

