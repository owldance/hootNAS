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
  # if dir baseos exists, display success message
  elif [ -d "baseos" ]; then
    echo
    echo "base system created successfully!"
    echo 
    echo "this new system will be used as a base for the hootos. to build the"
    echo "baseos, run the following command:"
    echo 
    echo "sudo build-baseos.sh <buildname>"
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
  exit 0
fi

# check user input
if [ "$EUID" -ne 0 ]; then
  echo "you must run this script as root"
  exit 1
elif [ ! "$(lsb_release -sc)" = "jammy" ]; then
  echo "this script must run on a jammy distro"
  exit 1
  # check if debootstrap is installed
elif [ ! -x "$(command -v debootstrap)" ]; then
  echo "debootstrap is not installed"
  echo "please install it with the following command:"
  echo
  echo "sudo apt install --yes debootstrap"
  echo
  exit 1
fi

echo "creating baseos directory"
mkdir baseos
echo
echo "creating base system, this may take a few minutes..."
echo
debootstrap jammy baseos
echo "cleaning up..."
# if bootstrap.log exists, remove it
[ -f baseos/var/log/bootstrap.log ] && rm baseos/var/log/bootstrap.log
