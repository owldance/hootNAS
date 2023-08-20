#!/bin/bash

# check if persistence is active, i.e. a zvol is mounted
if [ -n "$(ls /run/live/persistence | sed -n '/^zd[0-9]\+$/p')" ]; then
    echo "persistence is active"
    # disable TUI network configuration script on login
    # comment out the line that contains tui-network-config.sh
    sed -i '/tui-network-config.sh/s/^/#/' /root/.profile
    # start getty without root autologin
    /sbin/agetty -o '-p -- \\u' --noclear %I $TERM 2>&1
else
    echo "persistence is not active"
    # enable TUI network configuration script on login
    # uncomment the line that contains tui-network-config.sh
    sed -i '/tui-network-config.sh/s/^#//' /root/.profile
    # start getty with root autologin
    /sbin/agetty -i -a root --noclear %I $TERM 2>&1
fi

# https://bbs.archlinux.org/viewtopic.php?id=259179