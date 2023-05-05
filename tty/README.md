# hootOS - interactive terminal (tty) scripts

## [*network-config.sh*](./network-config.sh)

When executed, on the terminal screen, the script welcomes the user with the 
IP address of the system. 

If no DHCP server is available, or the script is unable to ping *ubuntu.com*, 
the user will be given the option to enter the ip address manually on the 
terminal screen.

The script is based on the
[dialog](https://manpages.ubuntu.com/manpages/jammy/man1/dialog.1.html) 
package, which provides as GUI-like interface on the terminal screen.

