#!/bin/bash
#
# this script will create a new hybrid BIOS/UEFI bootable iso file.
#
# usage:
#
#     sudo build-hootiso.sh <build-dir> <newiso> <nosquash>
#
# where <build-dir> is an existing build directory, and <newiso> is the 
# path and/or name of the new iso file to be built, if no path is given, the 
# iso will be created in the <build-dir>/<newiso> directory, any existing 
# file will be overwritten. if a path is given, it must exist.
#
# <nosquash> is an optional command, if specified, no compression of
# hootos will be done to save time. this is useful if you only have made
# changes to build-hootiso.sh and want to test them quickly. you must run
# build-hootiso.sh the first time without nosquash, so that the squashfs
# file is created."
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

# start measuring time
SECONDS=0

# set bash options
# -e            exit immediately if any command returns non-zero exit status
# -o pipefail   use exit status of the last command as exit status
set -e -o pipefail
# error handler, called on non-zero exit codes
function trapper {
  if [ $? -ne 0 ]; then
    echo "some error occured"
  else
    echo "done.. iso file can be found here:"
    # check if $new_iso has a path, if so, display path
        if [ "$(dirname $new_iso)" = "." ]; then
          echo "$PWD/$new_iso"
        else
          echo "$new_iso"
        fi
    echo
  fi
  # unmount overlay filesystem
  [ "$(mountpoint -q $PWD/hootos ; echo $?)" = 0 ] && \
    umount $PWD/hootos
  # delete tmpo directory
  [ -d "tmpo" ] && rm -r tmpo
  # restore original working directory
  cd $owd
  # calculate duration
  duration=$SECONDS
  duration_min=$(($duration / 60))
  duration_sec=$(($duration % 60))
  echo "runtime $duration_min minutes and $duration_sec seconds"
}
trap trapper EXIT

# get current working directory
owd=$PWD
# get commandline parameters
build_dir=$1
new_iso=$2

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ ! -d "$build_dir/hootos" ]; then 
  echo "directory $build_dir/hootos not found"
  user_err=1
elif [ ! -d "$(dirname $new_iso)" ] || [ ! "${new_iso##*.}" = "iso" ]; then
  echo "$new_iso is not an existing path, or filename does not end with .iso"
  user_err=1
fi

if [ $user_err = 1 ]; then
  echo
  echo "usage:"
  echo
  echo "    sudo ./build-hootiso.sh <build-dir> <newiso> <nosquash>"
  echo
  echo "where <build-dir> is an existing build directory, and <newiso> is the" 
  echo "path and/or name of the new iso file to be built, if no path is given, the"
  echo "iso will be created in the <build-dir>/<newiso> directory, any existing"
  echo "file will be overwritten. if a path is given, it must exist."
  echo
  echo "<nosquash> is an optional command, if specified, no compression of"
  echo "hootos will be done to save time. this is useful if you only have made"
  echo "changes to build-hootiso.sh and want to test them quickly. you must run"
  echo "build-hootiso.sh the first time without nosquash, so that the squashfs"
  echo "file is created."
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

# cd into build directory
cd $build_dir

# copy this script to source directory for reference
cp $HOOT_REPO/hoot-os/build-hootiso-$new_iso.sh source

# mounting overlay filesystem
echo "mounting overlay filesystem"
# if directory tmpo does not exist, create it
[ ! -d "tmpo" ] && mkdir tmpo
mount -t overlay overlay \
    -o lowerdir=../baseos,upperdir=staging,workdir=tmpo \
    $PWD/hootos

# create and populate the image directory 
mkdir -p isoimage/{live,install,assets}
cp -r $HOOT_REPO/hoot-os/iso-assets/boot isoimage
cp -r $HOOT_REPO/hoot-os/iso-assets/EFI isoimage
cp hootos/boot/vmlinuz isoimage/live/vmlinuz
cp hootos/boot/initrd.img isoimage/live/initrd

# if $3 is not "nosquash", compress system folder
if [ ! "$3" = "nosquash" ]; then
  # create manifest
  echo "creating manifest"
  chroot hootos \
  dpkg-query -W --showformat='${Package} ${Version}\n' | \
  tee isoimage/live/filesystem.manifest > /dev/null
  
  # compress (squash) system folder
  echo "compressing system folder"
  echo "ignore warnings about unrecognised xattr prefix"
  if [ -f "isoimage/live/filesystem.squashfs" ]; then 
      rm isoimage/live/filesystem.squashfs # delete old
  fi
  mksquashfs hootos isoimage/live/filesystem.squashfs

  # calculate filesize
  echo "calculating filesystem.size"
  printf $(du -sx --block-size=1 hootos | cut -f1) > \
  isoimage/live/filesystem.size
fi

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
# files created by xorriso:
# /boot.catalog 
xorriso -outdev $new_iso \
-blank as_needed \
-volid $iso_vol_name \
-volume_date uuid '2023022304134400' \
-boot_image grub \
        grub2_mbr="$HOOT_REPO/hoot-os/iso-assets/images/mbr_code_grub2.img" \
-boot_image any partition_table=on \
-boot_image any partition_cyl_align=off \
-boot_image any partition_offset=16 \
-boot_image any mbr_force_bootable=on \
-append_partition 2 28732ac11ff8d211ba4b00a0c93ec93b \
        $HOOT_REPO/hoot-os/iso-assets/images/gpt_part2_efi.img \
-boot_image any appended_part_as=gpt \
-boot_image any iso_mbr_part_type=a2a0d0ebe5b9334487c068b6b72699c7 \
-map isoimage / \
-boot_image any cat_path='/boot.catalog' \
-boot_image grub bin_path='/boot/grub/i386-pc/eltorito.img' \
-boot_image any platform_id=0x00 \
-boot_image any emul_type=no_emulation \
-boot_image any load_size=2048 \
-boot_image any boot_info_table=on \
-boot_image grub grub2_boot_info=on \
-boot_image any next \
-boot_image any efi_path='--interval:appended_partition_2:::' \
-boot_image any platform_id=0xef \
-boot_image any emul_type=no_emulation 




