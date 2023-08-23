#!/usr/bin/env /usr/bin/bash
#
# the script checks if persistence is active and enables or disables the TUI 
# network configuration script, and starts a tty with or without root autologin 
# accordingly.
#
# this script is called by getty@.service via 
# /etc/systemd/system/getty@.service.d/override.conf
# for at specific tty use e.g. getty@tty1.service.d
# it is called with two arguments, the first is the tty device, the second is
# the tty type, e.g. xterm and vt102.
#
# ISSUE: this workaround, as opposed to starting tty directly in `getty@.service` 
# unit file,  generates some warning messages in the journal, but 
# it works, it's probably a owner/permission issue, remains to be checked.
# agetty[1944]: /dev/tty1: cannot get controlling tty: Operation not permitted
# agetty[1944]: /dev/tty1: cannot get controlling tty: Operation not permitted
# agetty[1944]: /dev/tty1: cannot set process group: Inappropriate ioctl for device
#
# see: man systemd.unit and man systemd.service
#
tty.conditionlogin ()
{
    local tty=${1:-tty1}
    local term=${2:-$TERM}
    # check if persistence is active, i.e. a zvol is mounted
    if [ -d "/run/live/persistence" ]; then
        echo "persistence is active"
        # disable TUI network configuration script on login.
        # if the line that contains tui-network-config.sh and not a #, add #
        if ! grep -q '^#.*tui-network-config.sh' /root/.profile; then
            sed -i '/tui-network-config.sh/s/^/#/' /root/.profile
        fi
        # start getty without root autologin
        /sbin/agetty -o '-p -- \\u' --noclear $tty $term
    else
        echo "persistence is not active"
        # enable TUI network configuration script on login.
        # if the line that contains tui-network-config.sh and a #, remove #
        if grep -q '^#.*tui-network-config.sh' /root/.profile; then
            sed -i '/tui-network-config.sh/s/^#//' /root/.profile
        fi
        # start getty with root autologin
        /sbin/agetty -i -a root --noclear $tty $term
    fi
}
tty.conditionlogin "$@"