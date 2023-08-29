# hootOS - Miscellaneous scripts and other files

## [hootsrv.service](/scripts/hootsrv.service)

Is the `systemd` service unit file responsible for starting the 
[webserver](/webserver/webserver.mjs) on boot.


## [tui-network-config.sh](./network-config.sh)

Is a text user interface (TUI) terminal (tty) script, when executed, on the 
terminal screen, the script welcomes the user with the IP address of the system. 

If no addresses are found, it will automatically retry every 10 seconds, or 
the user can manually configure all ethernet network interfaces, or revert 
to DHCP.

The script is based on the
[dialog](https://manpages.ubuntu.com/manpages/jammy/man1/dialog.1.html) 
package, which provides as GUI-like interface on the terminal screen.

## [ttyautologin.sh](/scripts/ttyautologin.sh)

This script is called by `getty@.service`, it checks if persistence is active
and enables or disables the TUI network configuration script, and starts a 
tty with or without root autologin accordingly.
