#!/bin/bash
#
# usage:
#
#     sudo build-hootiso.sh <projectname> <originaliso> <newiso>
#
# where <projectname> is an existing project directory, and <originaliso> is 
# the path and name of the original ubuntu iso file that must exist, 
# and <newiso> is the path and name of the new iso file to be built, the path 
# must exist, any existing file will be overwritten. 
#
# this script will create a new hybrid BIOS/UEFI bootable iso file with the 
# system in the syshoot folder of the project directory.
#
# requirements:
# - squashfs-tools and xorriso packages installed
#

################################################################################
#                           USER VARIABLES
################################################################################
#
# the following variables are used to create the new iso file
# iso_vol_name should be ISO compatible [0-9A-Z_] 
iso_vol_name='HOOTNAS_22_04_2' 
disk_info='HOOTNAS 22.04.2'
disk_release_notes_url='https://github.com/owldance/hootNAS/blob/main/README.md'
# any valid uuid
disk_uuid_generic='6fa987c2-37b1-43ef-a880-77284b5f614f'
#
################################################################################

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ ! -d "$1/syshoot" ]; then 
  echo "hootOS system directory $1/syshoot not found"
  user_err=1
elif [ ! -d "$(dirname $2)" ] || [ ! "${2##*.}" = "iso" ]; then
  echo "$2 is not an existing path, or filename does not end with .iso"
  user_err=1
fi

if [ $user_err = 1 ]; then
  echo
  echo "usage:"
  echo
  echo "    sudo ./build-hootiso.sh <projectname> <newiso>"
  echo
  echo "where <projectname> is an existing project directory,"
  echo "and <newiso> is the path and name of the new iso file to be built,"
  echo "the path must exist, any existing file will be overwritten."
  echo
  exit 1
fi

# if $HOOT_REPO/hoot-os/iso-assets/boot directory does not exist, 
# extract assets from tar file $HOOT_REPO/hoot-os/iso-assets/iso-assets.tar.gz
if [ ! -d "$HOOT_REPO/hoot-os/iso-assets/boot" ]; then
  echo "extracting iso assets from tar file"
  tar -xzf $HOOT_REPO/hoot-os/iso-assets/iso-assets.tar.gz \
        -C $HOOT_REPO/hoot-os/iso-assets
fi

project_dir=$1
new_iso=$2

# cd into project directory
cd $project_dir

# create and populate the image directory 
mkdir -p isoimage/{live,install,assets}
cp -r $HOOT_REPO/hoot-os/iso-assets/boot isoimage
cp -r $HOOT_REPO/hoot-os/iso-assets/EFI isoimage
cp syshoot/boot/vmlinuz isoimage/live/vmlinuz
cp syshoot/boot/initrd.img isoimage/live/initrd

# # create manifest
# chroot syshoot \
# dpkg-query -W --showformat='${Package} ${Version}\n' | \
# tee isoimage/live/filesystem.manifest > /dev/null

# # compress (squash) system folder
# echo "ignore any warnings about any unrecognised xattr prefix"
# if [ -f "isoimage/live/filesystem.squashfs" ]; then 
#     rm isoimage/live/filesystem.squashfs # delete old
# fi
# mksquashfs syshoot isoimage/live/filesystem.squashfs

# # calculate filesize
# printf $(du -sx --block-size=1 syshoot | cut -f1) > \
# isoimage/live/filesystem.size

# This section is needed to make the USB Creator work with this custom iso image
if [ ! -L "isoimage/ubuntu" ]; then
    ln -s . isoimage/ubuntu
fi
if [ ! -d "isoimage/.disk" ]; then
    mkdir isoimage/.disk
fi
touch isoimage/.disk/base_installable
echo "full_cd/single" > isoimage/.disk/cd_type
echo "$disk_info" > isoimage/.disk/info
echo "$disk_release_notes_url" > isoimage/.disk/release_notes_url
echo "$disk_uuid_generic" > isoimage/.disk/live-uuid-generic

# live-boot options, see:
# https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html
cat <<EOF > isoimage/boot/grub/grub.cfg
set timeout=5
loadfont unicode
set menu_color_normal=white/black
set menu_color_highlight=black/light-gray

menuentry 'Boot hootNAS' {
        linux   /live/vmlinuz boot=live noeject persistence
        initrd  /live/initrd 
}
grub_platform
if [ "\$grub_platform" = "efi" ]; then
menuentry 'Boot from next volume' {
        exit 1
}
menuentry 'UEFI Firmware Settings' {
        fwsetup
}
else
menuentry 'Test memory' {
        linux16 /boot/memtest86+.bin
}
fi
EOF

# loopback.cfg is for booting a live distribution from an iso file on a 
# filesystem rather than an actual physical CD. 
cat <<EOF > isoimage/boot/grub/loopback.cfg
menuentry 'Boot hootNAS' {
        linux   /live/vmlinuz boot=live noeject persistent iso-scan/filename=\${iso_path} quiet splash 
        initrd  /live/initrd
}
EOF

# md5sum of everything in the image folder, except md5sum.txt itself
cd isoimage
find . -type f -print0 | \
xargs -0 md5sum | \
grep -v "md5sum.txt" > md5sum.txt
cd ..

# if $new_iso already exists, delete it
if [ -f "$new_iso" ]; then 
    rm $new_iso
fi

# a original iso recipie can be obtained with the following command:
# xorriso -indev $ORIGINAL_ISO -report_el_torito cmd
#
# the following command is a modified version of the original iso recipie,
# it will create the new iso file, overwrite if it already exists.
# files created by xorriso 
# /boot.catalog 
# /boot/grub/i386-pc/eltorito.img (dir must exist)
xorriso -outdev $new_iso \
-blank as_needed \
-volid $iso_vol_name \
-volume_date uuid '2023022304134400' \
-boot_image grub \
        grub2_mbr="$HOOT_REPO/hoot-os/iso-assets/images/grub2-mbr.img" \
-boot_image any partition_table=on \
-boot_image any partition_cyl_align=off \
-boot_image any partition_offset=16 \
-boot_image any mbr_force_bootable=on \
-append_partition 2 28732ac11ff8d211ba4b00a0c93ec93b \
        $HOOT_REPO/hoot-os/iso-assets/images/efi-partition.img \
-boot_image any appended_part_as=gpt \
-boot_image any iso_mbr_part_type=a2a0d0ebe5b9334487c068b6b72699c7 \
-map isoimage / \
-boot_image any cat_path='/boot.catalog' \
-boot_image grub bin_path='/boot/grub/i386-pc/eltorito.img' \
-boot_image any platform_id=0x00 \
-boot_image any emul_type=no_emulation \
-boot_image any boot_info_table=on \
-boot_image grub grub2_boot_info=on \
-boot_image any next \
-boot_image any efi_path='--interval:appended_partition_2:::' \
-boot_image any platform_id=0xef \
-boot_image any emul_type=no_emulation 

# cd out of project dir
cd ..

echo "done.. iso file can be found here:"
echo $new_iso
echo

