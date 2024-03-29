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
#

current_dir=$(pwd)
original_iso=$1

# check if iso-assets.tar.gz exists
if [ -f "$HOOT_REPO/hoot-os/assets/iso-assets.tar.gz" ]; then
    echo "iso-assets.tar.gz already exists"
    exit 1
fi

# check if original iso file exists
if [ ! -f "$original_iso" ]; then
    echo "original iso file does not exist"
    exit 1
fi

cd $HOOT_REPO/hoot-os/assets

# create required directories
mkdir boot EFI images

# extract assets from the ISO
osirrox -indev $original_iso \
         -extract boot boot \
         -extract EFI EFI \
         -osirrox on \
         -extract_boot_images images
# change permissions
chmod -R 764 EFI boot images

# these files are created in build-hootiso.sh
rm boot/grub/grub.cfg
rm boot/grub/loopback.cfg
# these images are created by xorriso in build-hootiso.sh
rm images/eltorito_catalog.img
rm images/systemarea.img
rm images/eltorito_img1_bios.img
# this image is duplicate of gpt_part2_efi.img
rm images/eltorito_img2_uefi.img

# the content of .img files, if they are not binary, 
# can be viewed with 7z (7-zip):
# 7z l images/gpt_part2_efi.img
#
# efi files are usually created when executing grub-install or 
# grub-update which then uses grub-mkimage to generate the image files. 

# create tarball of boot, EFI and images directories
tar -czvf iso-assets.tar.gz boot EFI images

# restore current directory
cd $current_dir
