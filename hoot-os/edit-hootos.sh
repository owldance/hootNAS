#!/bin/bash
#
# usage:"
#
#   sudo edit-hootos.sh <command> <buildname>
#    
# where <buildname> is an existing build directory in current working
# directory, and <command> can either be 'mount' or 'umount'. if
# 'mount' is specified, the script will mount the overlayfs and host
# filesystems to the hootos system in the build directory. you can then
# chroot into the hootos system:
#
# 1.    sudo chroot <buildname>"
# 2.    sudo chroot <buildname> /usr/bin/env bash --login"
#
# the first method you will simply present you with an interactive hootos"
# system prompt. the second method will first go through the login process"
# in either case you can revirew or make any changes you need,"
# and when you are done, type 'exit 0' to end the session. Then run this"
# script again with the 'umount' command to unmount the filesystems."
#
function trapper {
  if [ $? -ne 0 ]; then
    echo "some error occured"
  fi
}
trap trapper EXIT

# get commandline parameter
user_command=$1
build_dir=$2

# check user input
user_err=0
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_err=1
elif [ "$user_command" != "mount" ] && [ "$user_command" != "umount" ]; then
  echo "command must be either 'mount' or 'umount'"
  user_err=1
elif [ -z "$build_dir" ]; then
  echo "<buildname> directory not specified"
  echo
  user_err=1
elif [ ! -d "$build_dir" ]; then
  echo "<buildname> directory not found"
  echo "run 'sudo build-hootos.sh $build_dir' first,"
  echo "then run 'sudo edit-hootos.sh $user_command $build_dir'"
  echo
  user_err=1
elif [ ! -d "$build_dir/../baseos" ]; then
  echo "'baseos' directory not found in current working directory"
  echo "run 'sudo build-baseos.sh' first, then"
  echo "run 'sudo build-hootos.sh $build_dir' second, and finally"
  echo "run 'sudo edit-hootos.sh $user_command $build_dir'"
  echo
  user_err=1
# if 'mount' command, check if filesystem is already mounted
elif [ "$user_command" = "mount" ] && \
    [ "$(mountpoint -q $build_dir/hootos ; echo $?)" = 0 ]; then
  echo "overlay filesystem is already mounted, nothing to mount."
  echo "if you wish to unmount it, run 'sudo edit-hootos.sh umount $build_dir'"
  echo
  user_err=1
# if 'umount' command, check if filesystem is already unmounted
elif [ "$user_command" = "umount" ] && \
    [ "$(mountpoint -q $build_dir/hootos ; echo $?)" != 0 ]; then
  echo "overlay filesystem is not mounted, nothing to unmount."
  echo "if you wish to mount it, run 'sudo edit-hootos.sh mount $build_dir'"
  echo
  user_err=1
fi

# if user input is incorrect, exit
[ $user_err = 1 ] && exit 0

# if 'mount' command, mount overlay filesystem and host filesystems
if [ "$user_command" = "mount" ]; then
  echo "mounting overlay filesystem"
  [ ! -d "$build_dir/overwork" ] && mkdir $build_dir/overwork
  mount -t overlay overlay \
      -o lowerdir=baseos,upperdir=$build_dir/staging,workdir=$build_dir/overwork \
      $build_dir/hootos

  echo "mounting host filesystem"
  mount --make-private --rbind /dev $build_dir/hootos/dev
  mount --make-private --rbind /proc $build_dir/hootos/proc
  mount --make-private --rbind /sys $build_dir/hootos/sys
  echo "done"
  exit 0
fi
# if 'umount' command, unmount overlay filesystem and host filesystems
if [ "$user_command" = "umount" ]; then
  echo "unmounting host filesystem"
  # lazy umount because it's mounted recusively with --rbind
  [ "$(mountpoint -q $build_dir/hootos/dev ; echo $?)" = 0 ] && umount -lf $build_dir/hootos/dev
  [ "$(mountpoint -q $build_dir/hootos/proc ; echo $?)" = 0 ] && umount -lf $build_dir/hootos/proc
  [ "$(mountpoint -q $build_dir/hootos/sys ; echo $?)" = 0 ] && umount -lf $build_dir/hootos/sys
  # unmount overlay filesystem
  echo "unmounting overlay filesystem"
  [ "$(mountpoint -q $build_dir/hootos ; echo $?)" = 0 ] && \
    umount $build_dir/hootos
  # delete overwork directory
  [ -d "$build_dir/overwork" ] && rm -r $build_dir/overwork
else
  echo "overlay filesystem is not mounted, nothing to unmout"
fi



