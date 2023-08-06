#!/bin/bash
#
# usage:"
#
#     sudo edit-hootos.sh <command> <hootos-dir> "
#
# where <hootos-dir> is an existing hootos directory, and <command> can"
# either be 'mount' or 'umount'. if 'mount' is specified, the script will"
# mount the overlayfs and host filesystems to the hootos system in the"
# build directory. you can then chroot into the hootos system:"
# 1.    sudo chroot <hootos-dir>"
# 2.    sudo chroot <hootos-dir> /usr/bin/env bash --login"
# the first method you will simply present you with an interactive hootos"
# system prompt. the second method will first go through the login process"
# in either case you can revirew or make any changes you need,"
# and when you are done, type 'exit 0' to end the session. Then run this"
# script again with the 'umount' command to unmount the filesystems."
#
#
set -e -o pipefail
function trapper {
  # if error is 2, then user input was incorrect, print usage
  if [ $? -eq 2 ]; then
    echo "usage:"
    echo
    echo "    sudo edit-hootos.sh <command> <hootos-dir> "
    echo
    echo "where <hootos-dir> is an existing hootos directory, and <command> can"
    echo "either be 'mount' or 'umount'. if 'mount' is specified, the script will"
    echo "mount the overlayfs and host filesystems to the hootos system in the"
    echo "build directory. you can then chroot into the hootos system:"
    echo "1.    sudo chroot <hootos-dir>"
    echo "2.    sudo chroot <hootos-dir> /usr/bin/env bash --login"
    echo "the first method you will simply present you with an interactive hootos"
    echo "system prompt. the second method will first go through the login process"
    echo "in either case you can revirew or make any changes you need,"
    echo "and when you are done, type 'exit 0' to end the session. Then run this"
    echo "script again with the 'umount' command to unmount the filesystems."
    echo
  fi
  if [ $? -ne 0 ]; then
    echo "some error occured"
  fi
}
trap trapper EXIT

# get commandline parameter
user_command=$1
hootos_dir=$2

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ "$user_command" != "mount" ] && [ "$user_command" != "umount" ]; then
  echo "command must be either 'mount' or 'umount'"
  user_err=1
elif [ -z "$hootos_dir" ]; then
  echo "hootos directory not specified"
  echo
  user_err=1
elif [ ! -d "$hootos_dir" ]; then
  echo "hootos directory not found"
  echo "run build-hootos.sh first then run edit-hootos.sh"
  echo
  user_err=1
elif [ ! -d "$hootos_dir/../../baseos" ]; then
  echo "../baseos directory not found"
  echo "run build-baseos.sh first, then run build-hootos.sh, and"
  echo "only then you can run edit-hootos.sh"
  echo
  user_err=1

# if 'mount' command, check if hootos directory is empty 
elif [ "$user_command" = "mount" ] && ["$(ls -A $hootos_dir)" ]; then
  echo "hootos directory is not empty, either it is not a hootos directory, or"
  echo "it is already mounted, if you wish to unmount it, run:"
  echo "edit-hootos.sh umount $hootos_dir"
  echo
  user_err=1
fi

# if user input is incorrect, exit
[ $user_err = 1 ] && exit 2

# if 'mount' command, mount overlay filesystem and host filesystems
if [ "$user_command" = "mount" ]; then
  echo "mounting overlay filesystem"
  [ ! -d "$hootos_dir/../tmpo" ] && mkdir $hootos_dir/../tmpo
  mount -t overlay overlay \
      -o lowerdir=$hootos_dir/../../baseos,upperdir=$hootos_dir/../staging,workdir=$hootos_dir/../tmpo \
      $hootos_dir

  echo "mounting host filesystem"
  mount --make-private --rbind /dev $hootos_dir/dev
  mount --make-private --rbind /proc $hootos_dir/proc
  mount --make-private --rbind /sys $hootos_dir/sys
  echo "done"
  exit 0
fi
# if 'umount' command, unmount overlay filesystem and host filesystems
if [ "$user_command" = "umount" ]; then
  echo "unmounting host filesystem"
  # lazy umount because it's mounted recusively with --rbind
  [ "$(mountpoint -q $hootos_dir/dev ; echo $?)" = 0 ] && umount -lf $hootos_dir/dev
  [ "$(mountpoint -q $hootos_dir/proc ; echo $?)" = 0 ] && umount -lf $hootos_dir/proc
  [ "$(mountpoint -q $hootos_dir/sys ; echo $?)" = 0 ] && umount -lf $hootos_dir/sys
  # unmount overlay filesystem
  echo "unmounting overlay filesystem"
  [ "$(mountpoint -q $hootos_dir ; echo $?)" = 0 ] && \
    umount $hootos_dir
  # delete tmpo directory
  [ -d "$hootos_dir/../tmpo" ] && rm -r $hootos_dir/../tmpo
fi



