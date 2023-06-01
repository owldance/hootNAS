#!/bin/bash
#
# usage:
#
#     sudo modify-syshoot.sh <projectname>
#
# where <projectname> is an existing project dirctory
#
# if you need to edit or debug the system you have built, the above command 
# will login (chroot) on the system in the <projectname>/syshoot directory and 
# present you with a system prompt, there you can make any changes you need. 
# When you are done, type 'exit' to end the session.
#

project_dir=$1

set -e -o pipefail
function trapper {
  if [ $? -ne 0 ]; then
    echo "must run as root"
    echo
    echo "usage "
    echo "     sudo ./modify-syshoot.sh <projectname>"
    echo
    echo "where <projectname> is an existing project folder"
    echo 
  fi
  # cd out of project dir
  cd ..
}
trap trapper EXIT

# are we root?
if [ "$EUID" -ne 0 ]; then
  echo "must run as root"
  echo
  exit 1
fi

# check if system folder exists
if [ ! -d "$project_dir/syshoot" ]; then
  echo "project dir $project_dir/syshoot does not exist"
  echo
  exit 1
fi
cd $project_dir # cd into project dir

mount --make-private --rbind /dev syshoot/dev
mount --make-private --rbind /proc syshoot/proc
mount --make-private --rbind /sys syshoot/sys
echo "host filesystems has been bound to $project_dir/syshoot"
chroot syshoot /usr/bin/env bash --login
# lazy umount because it's mounted recusively with --rbind
umount -lf syshoot/dev
umount -lf syshoot/proc
umount -lf syshoot/sys
echo "host filesystems has been unbound from $project_dir/syshoot"
exit 0
