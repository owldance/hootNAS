#!/bin/bash
#
# usage:
#
#     sudo build-baseos.sh 
#
# this script will create full (minimal) ubuntu installation from online ubuntu
# source repositories. it will create a new directory "baseos" in the
# current working directory. this directory will contain the new system.
# 
# requirements:
# - internet connection
# - must be run as root on a jammy distro
# - debootstrap package installed.
#
# start measuring time
SECONDS=0

# set bash options
# -e            exit immediately if any command returns non-zero exit status
# -o pipefail   use exit status of the last command as exit status
set -e -o pipefail

# error handler, called on non-zero exit codes
function trapper {
  if [ $? -ne 0 ]; then
    echo "fatal error!"
    if [ -d "baseos" ]; then
      echo "removing baseos directory..."
      rm -rf baseos
      echo "done"
    fi
  # if dir baseos exists and user_error is not 1, sucess
  elif [ -d "baseos" ] && [ "$user_error" -ne 1 ]; then
    echo
    echo "base system created successfully!"
    echo 
    echo "this new system will be used as a base for the hootos. to build the"
    echo "hootos, run the following command:"
    echo 
    echo "sudo build-hootos.sh <buildname>"
    echo
    echo "where <buildname> is a unique name of the build you want to create."
    echo
    # calculate duration
    duration=$SECONDS
    duration_min=$(($duration / 60))
    duration_sec=$(($duration % 60))
    echo "runtime $duration_min minutes and $duration_sec seconds"
  fi
}
trap trapper EXIT

user_error=0
# if $1 is not empty, display usage and exit
if [ ! -z "$1" ]; then
  echo 
  echo "usage:"
  echo 
  echo "    sudo build-baseos.sh"
  echo 
  echo "this script will create full (minimal) ubuntu installation from online"
  echo "ubuntu source repositories. it creates a new directory 'baseos'" 
  echo "in the current working directory. this directory will contain the"
  echo "new system."
  echo
  echo "requirements:"
  echo "- internet connection"
  echo "- must be run as root on a jammy distro"
  echo "- debootstrap package installed."
  user_error=1
fi

# check user input
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  user_error=1
elif [ ! "$(lsb_release -sc)" = "jammy" ]; then
  echo "this script must run on a jammy distro"
  user_error=1
elif [ -d "baseos" ]; then
  echo "baseos directory already exists"
  user_error=1
  # check if debootstrap is installed
elif [ ! -x "$(command -v debootstrap)" ]; then
  echo "debootstrap is not installed"
  echo "please install it with the following command:"
  echo
  echo "sudo apt install --yes debootstrap"
  echo
  user_error=1
fi

# exit if user error
[ "$user_error" -eq 1 ] &&  exit 0

echo "creating baseos directory"
mkdir baseos
echo
echo "creating base system, this may take a few minutes..."
echo
debootstrap jammy baseos
echo "cleaning up..."
# if bootstrap.log exists, remove it
[ -f baseos/var/log/bootstrap.log ] && rm baseos/var/log/bootstrap.log
