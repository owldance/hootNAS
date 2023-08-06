#!/bin/bash
#
# usage:
#
#     extract-iso-assets.sh <originaliso>
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
original_iso=$1

# check if original iso file exists
if [ ! -f "$original_iso" ]; then
    echo "original iso file does not exist"
    exit 1
fi

cd $HOOT_REPO/hoot-os/iso-assets

# create required directories
mkdir boot EFI images

# extract the files from the ISO
osirrox -indev $ORIGINAL_ISO \
         -extract boot boot \
         -extract EFI EFI
# change permissions
chmod -R 764 EFI
chmod -R 764 boot

# these files are created by build-hootiso.sh so we can remove them
rm boot/grub/grub.cfg
rm boot/grub/loopback.cfg
rm boot/grub/i386-pc/eltorito.img

# extract the MBR from original iso
# the MBR is 512 bytes large and is located in sector 1 of a disk, 
# it is a hybrid protective EFI GPT (type 0xEE) MBR.
# we only need the x86 code, so we copy 432 bytes. all partition stuff will 
# be updated by xorriso in build-hootiso.sh
dd if=$original_iso \
    bs=1 \
    count=432 \
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

# efi files are usually created when executing grub-install or 
# grub-update which then uses grub-mkimage to generate the image files. 

# create tarball of boot, EFI and images directories
tar -czvf iso-assets.tar.gz boot EFI images

# restore current directory
cd $current_dir
