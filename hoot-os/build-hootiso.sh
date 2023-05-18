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
# this script will create a new hybrid BIOS/UEFI bootable iso file using the 
# original ubuntu as a template. if you are using a ubuntu version other than 
# the below mentioned, you will most likely have to modify the xorriso
# command in this script.
#
# requirements:
# - a ubuntu-22.04.2-desktop-amd64.iso file
# - squashfs-tools and xorriso packages installed
#

################################################################################
#                           USER VARIABLES
################################################################################
#
# the following variables are used to create the new iso file
# ISO compatible volume name [0-9A-Z_] 
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
elif [ ! -f "$2" ] || [ ! "${2##*.}" = "iso" ]; then 
  echo "$2 is not an existing ubuntu iso file"
  user_err=1
elif [ ! -d "$(dirname $3)" ] || [ ! "${3##*.}" = "iso" ]; then
  echo "$3 is not an existing path, or filename does not end with .iso"
  user_err=1
fi

if [ $user_err = 1 ]; then
  echo
  echo "usage:"
  echo
  echo "    sudo ./build-hootiso.sh <projectname> <originaliso> <newiso>"
  echo
  echo "where <projectname> is an existing project directory, and <originaliso> is"
  echo "the path and name of the original ubuntu iso file that must exist,"
  echo "and <newiso> is the path and name of the new iso file to be built, the path"
  echo "must exist, any existing file will be overwritten."
  echo
  exit 1
fi

project_dir=$1
original_iso=$2
new_iso=$3

# mount the original iso
mkdir -p /mnt/isodtp
echo "mount -o loop $original_iso /mnt/isodtp"
mount -o loop $original_iso /mnt/isodtp
if [ ! -d '/mnt/isodtp/boot' ] 
  then 
    echo "original iso is not mounted"
    umount /mnt/isodtp
    rm -r /mnt/isodtp
    exit 1
fi

# cd into project directory
cd $project_dir

# create and populate the image directory 
mkdir -p isoimage/{live,install,assets}
cp -r /mnt/isodtp/boot isoimage
cp -r /mnt/isodtp/EFI isoimage
cp /mnt/isodtp/boot.catalog isoimage
cp syshoot/boot/vmlinuz isoimage/live/vmlinuz
cp syshoot/boot/initrd.img isoimage/live/initrd

# create manifest
chroot syshoot \
dpkg-query -W --showformat='${Package} ${Version}\n' | \
tee isoimage/live/filesystem.manifest > /dev/null

# compress (squash) system folder
echo "ignore any warnings about any unrecognised xattr prefix"
if [ -f "isoimage/live/filesystem.squashfs" ]; then 
    rm isoimage/live/filesystem.squashfs # delete old
fi
mksquashfs syshoot isoimage/live/filesystem.squashfs

# calculate filesize
printf $(du -sx --block-size=1 syshoot | cut -f1) > \
isoimage/live/filesystem.size

# This is needed to make the USB Creator work with this custom iso image
ln -s . isoimage/ubuntu
mkdir isoimage/.disk
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

# a original iso recipie can be obtained with the following command:
#
# xorriso \
# -indev $original_iso \
# -report_el_torito as_mkisofs
#
# the following command is a modified version of the original iso recipie,
# it will create the new iso file, overwrite if it already exists
xorriso -as mkisofs \
-V $iso_vol_name \
--modification-date="$(date +%Y%m%d%H%M%S)00" \
--grub2-mbr \
--interval:local_fs:0s-15s:zero_mbrpt,zero_gpt:$original_iso \
--protective-msdos-label \
-partition_cyl_align off \
-partition_offset 16 \
--mbr-force-bootable \
-append_partition 2 28732ac11ff8d211ba4b00a0c93ec93b \
--interval:local_fs:9613460d-9623527d::$original_iso \
-appended_part_as_gpt \
-iso_mbr_part_type a2a0d0ebe5b9334487c068b6b72699c7 \
-c '/boot.catalog' \
-b '/boot/grub/i386-pc/eltorito.img' \
-no-emul-boot \
-boot-load-size 4 \
-boot-info-table \
--grub2-boot-info \
-eltorito-alt-boot \
-e '--interval:appended_partition_2_start_2403365s_size_10068d:all::' \
-no-emul-boot \
-boot-load-size 10068 \
-o $new_iso \
isoimage

# cd out of project dir
cd ..

# unmount the original iso
umount /mnt/isodtp
rm -r /mnt/isodtp

echo "done.. iso file can be found here:"
echo $new_iso
echo

