# hootOS - Bash scripts

## [*onlogin.sh*](./onlogin.sh)

This script is executed during the first boot when root is automatically 
logged in and the user is expected to setup the storagepool via the webapp. 

First time the script runs it tries to import the storagepool, which fails 
because it doesn't exist yet, then executes `netowrk-config.sh`.

Second time the script runs it tries to import the storagepool again, this
time it succeeds and the cache file `/etc/zfs/zpool.cache` is created, and the 
`zfs-import-cache.service` can import the storagepool on all subsequent boots, 
because now `live-boot` persistancy is active. The script also removes root 
auto login and prevent itself from running again.

## [*network-config.sh*](./network-config.sh)

Is a interactive terminal (tty) script, when executed, on the terminal screen, 
the script welcomes the user with the IP address of the system. 

If no DHCP server is available, or the script is unable to ping *ubuntu.com*, 
the user will be given the option to enter the ip address manually on the 
terminal screen.

# create a systemd service unit file that executes the bash script 
# ifpersistence.sh before terminal is ready.
# multi-user.target target unit is reached before the TTY terminal is ready. 
# multi-user.target target unit is reached after the basic system 
# initialization is complete, and before the system is fully operational, such 
# as network services or system monitoring services.

cat <<EOF >hootos/etc/systemd/system/ifpersistence.service

The script is based on the
[dialog](https://manpages.ubuntu.com/manpages/jammy/man1/dialog.1.html) 
package, which provides as GUI-like interface on the terminal screen.

