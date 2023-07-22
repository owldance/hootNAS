# Create a BIOS and/or UEFI hybrid linux boot disk from scratch

### Using ubuntu 22.04, the GRUB2 bootloader and GPT partitions in a virtual machine.

Using this approach is simpler than having two options. It is also provides 
future proofing in the sense that you can move the disk to a new motherboard 
in the future without having to rebuild the system and restore your data from 
a backup. 

### Preparation
    
1. You will need probably to install the following packages first
    ```
    apt install --yes debootstrap # Bootstrap a basic Debian system
    apt install --yes dosfstools  # Create FAT filesystems
    ```
### Formatting the disk
2. Locate the device you want to install the bootloader on
    ```
    ls -l /dev/disk/by-id/
    ```
    Since we booted from a live CD and we only have one device, the output 
    should look something like this
    ```
    total 0
    lrwxrwxrwx 1 root root  9 Jul 22 14:11 ata-QEMU_DVD-ROM_QM00001 -> ../../sr0
    lrwxrwxrwx 1 root root  9 Jul 22 14:11 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1 -> ../../sda
    ```
3. Make a variable for the device, so we can use it later
    ```
    bootdisk=/dev/disk/by-id/scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1
    ```
4. Create GPT partitions for UEFI booting, linux system root, and legacy BIOS 
booting. Throughout this guide you can omit one or the other if you only want 
to support only one boot method. The `-a1` option aligns the partition to 1M, 
which is required for the BIOS boot partition. You should probably make 
the EFI partition minimum 2G if you want to be able to update the kernel in 
the future.
    ```
    sgdisk     -n1:1M:+512M   -t1:EF00 $disk # EFI System Partition (ESP)
    sgdisk     -n2:0:0        -t2:8304 $disk # Linux x86-64 root partition (/)
    sgdisk -a1 -n3:24K:+1000K -t3:EF02 $disk # BIOS boot partition
    ```
    We now see the following devices in `/dev/disk/by-id/`
    ```
    total 0
    lrwxrwxrwx 1 root root  9 Jul 22 14:11 ata-QEMU_DVD-ROM_QM00001 -> ../../sr0
    lrwxrwxrwx 1 root root  9 Jul 22 14:11 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1 -> ../../sda
    lrwxrwxrwx 1 root root 10 Jul 22 14:11 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part1 -> ../../sda1
    lrwxrwxrwx 1 root root 10 Jul 22 14:11 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part2 -> ../../sda2
    lrwxrwxrwx 1 root root 10 Jul 22 14:11 scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1-part3 -> ../../sda3
    ```
### Creating filesystems
5. Make a FAT filesystem on the EFI partition, and an ext2 filesystem on the 
linux root partition. 
    ```
    mkdosfs -F 32 -s 1 -n EFI ${bootdisk}-part1
    mkfs.ext2 ${bootdisk}-part2
    ```
### Create a new ubuntu system

6. Mount the root partition so we can create a new ubuntu system on it
    ```
    mount ${bootdisk}-part2 /mnt
    ```
7. Bootstrap a basic ubuntu system on the root partition
    ```
    debootstrap jammy /mnt
    ```
8. Configure package sources for the new system and update the package cache
    ```
    cat <<EOF > /mnt/etc/apt/sources.list
    deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
    deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
    deb http://archive.ubuntu.com/ubuntu jammy-backports main restricted universe multiverse
    deb http://security.ubuntu.com/ubuntu jammy-security main restricted universe multiverse
    EOF
    ```
9. Mounting the /dev /proc and /sys directories from the working system to 
the new system will bring it to life.
    ```
    mount --make-private --rbind /dev  /mnt/dev
    mount --make-private --rbind /proc /mnt/proc
    mount --make-private --rbind /sys  /mnt/sys
    ```
10. chroot into the new system
    ```
    chroot /mnt
    ``` 
### You are now working inside the new system until you issue a `exit` command 

### Install bootloader

11. Run apt update
    ```
    apt update
    ```

11. Mount the EFI partition to `/boot/efi` in the new system, and add it to 
`/etc/fstab` so it will be mounted automatically on boot. 

    ***Caveat:*** If you move the disk to a new motherboard, the disk might 
    get a new id in `/dev/disk/by-id/`, in which case you will have to update 
    `/etc/fstab` accordingly.

    ```
    mkdir /boot/efi
    echo ${bootdisk}-part1 /boot/efi vfat defaults 0 0 >> /etc/fstab
    mount /boot/efi
    ```
12. Mount `/boot/efi/grub` (which resides on the EFI partition) to 
`/boot/grub` on the new system, and add it to `/etc/fstab` so it will be 
mounted automatically on boot. This is so we can have a single `grub.cfg` that 
can work for both BIOS and UEFI booting, and also be updated by the 
`update-grub` command.

    ```
    mkdir /boot/efi/grub /boot/grub
    echo /boot/efi/grub /boot/grub none defaults,bind 0 0 >> /etc/fstab
    mount /boot/grub
    ```
13. Lets review what we in in `/boot` so far: The EFI partition is mounted on 
`/boot/efi` and the `/boot/efi/grub` directory on the EFI partition is mounted 
on `/boot/grub` which is on the root partition, effectively making the 
`/boot/grub` directory a symlink to `/boot/efi/grub` on the EFI partition.
    ```
    /boot
    ├── efi
    │   └── grub
    └── grub

    3 directories, 0 files
    ```
14. Install linux kernel and headers
    ```
    apt install --yes linux-image-$(uname -r)
    apt install --yes linux-headers-$(uname -r)
    ```
15. Lets review again the content in `/boot`
    ```
    /boot
    ├── config-5.19.0-43-generic
    ├── efi
    │   └── grub
    │       ├── gfxblacklist.txt
    │       └── unicode.pf2
    ├── grub
    │   ├── gfxblacklist.txt
    │   └── unicode.pf2
    ├── initrd.img -> initrd.img-5.19.0-43-generic
    ├── initrd.img-5.19.0-43-generic
    ├── initrd.img.old -> initrd.img-5.19.0-43-generic
    ├── System.map-5.19.0-43-generic
    ├── vmlinuz -> vmlinuz-5.19.0-43-generic
    ├── vmlinuz-5.19.0-43-generic
    └── vmlinuz.old -> vmlinuz-5.19.0-43-generic
    3 directories, 12 files
    ```
16. Install the GRUB2 bootloader, which contain all files for BIOS booting.
    ```
    apt install --yes grub-pc
    ```
17. Install GRUB2 EFI bootloader which contains additional files for UEFI 
booting. `grub-efi-amd64` requires `grub-pc` to be installed first.
    ```
    apt install --yes grub-efi-amd64
    ```
18. Then we update the initrd image
    ```
    update-initramfs -c -k all
    ```
19. Optional, make a backup of the original grub configuration file 
`/etc/default/grub`, then either edit it manually or use the following
commands to generate a new one suitable for debugging
    ```
    cp /etc/default/grub /etc/default/grub.bak
    cat <<HEREDOC > /mnt/etc/default/grub
    GRUB_DEFAULT=0
    GRUB_TIMEOUT=5
    GRUB_RECORDFAIL_TIMEOUT=5
    GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
    GRUB_CMDLINE_LINUX_DEFAULT="init_on_alloc=0"
    GRUB_CMDLINE_LINUX=""
    GRUB_DISABLE_OS_PROBER=true
    HEREDOC
    ```
20. Update the grub configuration file, i.e. this command generates 
`/boot/grub/grub.cfg` from `/etc/default/grub` and 
`/etc/default/grub.d/init-select.cfg`
    ```
    update-grub
    ```
21. Set the root password
    ```
    passwd
    ```
22. Lets review again the content in `/boot` which now reveals the entire 
anatomy of the GRUB2 bootloader. The only parts that are specific to UEFI 
booting are `/boot/efi/EFI` and `/boot/efi/grub/x86_64-efi` and by extension 
`/boot/grub/x86_64-efi` (see #13), the rest is common to both BIOS and UEFI 
booting.

    ```
    /boot
    ├── config-5.19.0-43-generic
    ├── efi
    │   ├── EFI
    │   │   ├── BOOT
    │   │   │   ├── BOOTX64.EFI
    │   │   │   ├── fbx64.efi
    │   │   │   └── mmx64.efi
    │   │   └── ubuntu
    │   │       ├── BOOTX64.CSV
    │   │       ├── grub.cfg
    │   │       ├── grubx64.efi
    │   │       ├── mmx64.efi
    │   │       └── shimx64.efi
    │   └── grub
    │       ├── fonts
    │       │   └── unicode.pf2
    │       ├── grub.cfg
    │       ├── grubenv
    │       ├── i386-pc
    │       │   └── (288 .mod files)
    │       ├── locale
    │       ├── unicode.pf2
    │       └── x86_64-efi
    │           └── (278 .mod files)
    ├── grub
    │   ├── fonts
    │   │   └── unicode.pf2
    │   ├── grub.cfg
    │   ├── grubenv
    │   ├── i386-pc
    │   │   └── (288 .mod files)
    │   ├── locale
    │   ├── unicode.pf2
    │   └── x86_64-efi
    │       └── (278 .mod files)
    ├── initrd.img -> initrd.img-5.19.0-43-generic
    ├── initrd.img-5.19.0-43-generic
    ├── initrd.img.old -> initrd.img-5.19.0-43-generic
    ├── System.map-5.19.0-43-generic
    ├── vmlinuz -> vmlinuz-5.19.0-43-generic
    ├── vmlinuz-5.19.0-43-generic
    └── vmlinuz.old -> vmlinuz-5.19.0-43-generic
    14 directories, 1156 files
    ```
22. Exit the new system chroot
    ```
    exit
    ```
### You are now back in the working system 

Disk usage is 880M for the root partition and 16M for the EFI partition, as 
shown by the `df -h` command.

```
Filesystem     1K-blocks   Used Available Use% Mounted on
/dev/sda2        3604204 880052   2540704  26% /mnt
/dev/sda1         516190  15932    500259   4% /mnt/boot/efi
```

23. You can now boot from the disk and test the new system with the password 
you set in step #22. 




