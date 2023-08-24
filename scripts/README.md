# hootOS - Miscellaneous scripts and other files

## [hootsrv.service](/scripts/hootsrv.service)

Is the `systemd` service unit file responsible for starting the 
[webserver](/webserver/webserver.mjs) on boot.


## [tui-network-config.sh](./network-config.sh)

Is an text user interface (TUI) terminal (tty) script, when executed, on the 
terminal screen, the script welcomes the user with the IP address of the system. 

If no DHCP server is available, or the script is unable to ping `ubuntu.com`, 
the user will be given the option to enter the ip address manually on the 
terminal screen.

The script is based on the
[dialog](https://manpages.ubuntu.com/manpages/jammy/man1/dialog.1.html) 
package, which provides as GUI-like interface on the terminal screen.

## [conditionlogin.sh](/scripts/conditionlogin.sh)

This script is called by `getty@.service`, it checks if persistence is active
and enables or disables the TUI network configuration script, and starts a 
tty with or without root autologin accordingly.
