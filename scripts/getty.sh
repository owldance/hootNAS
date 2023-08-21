#!/bin/bash

# this script is called by getty@.service, it checks if persistence is active
# and enables or disables the TUI network configuration script, and starts a 
# tty with or without root autologin accordingly.
# It is called with two arguments, the first is the tty device, the second is
# the tty type, e.g. xterm and vt102.
#
# ISSUE: this workaround, as opposed to starting tty directly in `getty@.service` 
# unit file,  generates some warning messages in the journal, but 
# it works, it's probably a owner/permission issue, remains to be checked.
# agetty[1944]: /dev/tty1: cannot get controlling tty: Operation not permitted
# agetty[1944]: /dev/tty1: cannot get controlling tty: Operation not permitted
# agetty[1944]: /dev/tty1: cannot set process group: Inappropriate ioctl for device
# see: https://bbs.archlinux.org/viewtopic.php?id=259179


# check if persistence is active, i.e. a zvol is mounted
if [ -n "$(ls /run/live/persistence | sed -n '/^zd[0-9]\+$/p')" ]; then
    echo "persistence is active"
    # disable TUI network configuration script on login.
    # if the line that contains tui-network-config.sh and not a #, add #
    if ! grep -q '^#.*tui-network-config.sh' /root/.profile; then
        sed -i '/tui-network-config.sh/s/^/#/' /root/.profile
    fi
    # start getty without root autologin
    /sbin/agetty -o '-p -- \\u' --noclear $1 $2 2>&1
else
    echo "persistence is not active"
    # enable TUI network configuration script on login.
    # if the line that contains tui-network-config.sh and a #, remove #
    if grep -q '^#.*tui-network-config.sh' /root/.profile; then
        sed -i '/tui-network-config.sh/s/^#//' /root/.profile
    fi
    # start getty with root autologin
    /sbin/agetty -i -a root --noclear $1 $2 2>&1
fi



