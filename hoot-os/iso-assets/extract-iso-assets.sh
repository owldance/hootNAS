#!/bin/bash
#
# usage:
#
#     extract-assets-from-iso.sh <originaliso>
#
# where <originaliso> is the path and name of the original ubuntu iso file 
# that must exist
#
# this script extract all assets from the original ubuntu iso file that are
# needed to create a new hybrid BIOS/UEFI bootable iso file using the
# build-hootiso.sh script. It will also create a tarball of the extracted
# assets, so this becomes a one-time operation, and there is no need for the
# devloper to download the original iso file.
#
# requirements:
# - a ubuntu-22.04.2-desktop-amd64.iso file
#
# ref: https://askubuntu.com/questions/1403546/ubuntu-22-04-build-iso-both-mbr-and-efi
#

current_dir=$(pwd)
cd $HOOT_REPO/hoot-os/iso-assets

me=$(id -nu)
mygroup=$(id -ng)
original_iso=$1

# mount original iso 
sudo mkdir /mnt/isodtp
sudo mount -o loop $original_iso /mnt/isodtp

# copy /boot and /EFI folders to hoot-os/iso-assets
sudo cp -r /mnt/isodtp/boot .
sudo cp -r /mnt/isodtp/EFI .

# unmount original iso 
sudo umount /mnt/isodtp
sudo rm -r /mnt/isodtp 

# change ownership and permissions
sudo chown -R $me:$mygroup boot
sudo chmod -R 764 boot
sudo chown -R $me:$mygroup EFI
sudo chmod -R 764 EFI
# these files are created by build-hootiso.sh so we can remove them
rm boot/grub/grub.cfg
rm boot/grub/loopback.cfg
rm boot/grub/i386-pc/eltorito.img

# get some info about the original iso
gdisk -l $original_iso
# GPT fdisk (gdisk) version 1.0.8

# Partition table scan:
#   MBR: protective
#   BSD: not present
#   APM: not present
#   GPT: present

# Found valid GPT with protective MBR; using GPT.
# Disk ubuntu-22.04.2-desktop-amd64.iso: 9624192 sectors, 4.6 GiB
# Sector size (logical): 512 bytes
# Disk identifier (GUID): A0891D7E-B930-4513-94D9-F629DBD637B2
# Partition table holds up to 248 entries
# Main partition table begins at sector 2 and ends at sector 63
# First usable sector is 64, last usable sector is 9624128
# Partitions will be aligned on 4-sector boundaries
# Total free space is 1 sectors (512 bytes)

# Number  Start (sector)    End (sector)  Size       Code  Name
#    1              64         9613459   4.6 GiB     0700  ISO9660
#    2         9613460         9623527   4.9 MiB     EF00  Appended2
#    3         9623528         9624127   300.0 KiB   0700  Gap1
#
#
# We can see that partition 1 is the entire DVD, partition 2 is the 
# EFI partition and partition 3 is a traditional gap which is only needed 
# on CD media written by write type Track-At-Once.

# Create directory for partition images if it does not exist
mkdir -p images

# extract the MBR from original iso
# The MBR is 512 bytes large and is located in the first sector of a disk, 
# we only need the x86 code, so we copy 432 bytes. 
# All partition stuff will be created by xorriso
dd if=$original_iso \ 
    bs=1 count=432 \
    of=images/grub2-mbr.img


# extract the EFI System Partition (ESP) from original iso
# bs= Sector size (logical) = 512 bytes, i.e. starting after MBR 
# skip= Start (sector) = 9613460
# count= Start (sector) - End (sector) + 1 = 10068
#
# parse output of gdisk -l command, and calculate skip and count
skip=$(gdisk -l $original_iso | grep -Eo '2\s+[0-9]+\s+[0-9]+' | awk '{print $2}')
count=$(gdisk -l $original_iso | grep -Eo '2\s+[0-9]+\s+[0-9]+' | awk '{print $3-$2+1}')

dd if=$original_iso \
    bs=512 \
    skip=$skip \
    count=$count \
    of=images/efi-partition.img

# create tarball of boot and EFI folders
tar -czvf iso-assets.tar.gz boot EFI images

# restore current directory
cd $current_dir



