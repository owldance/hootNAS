# hootOS - in-memory ubuntu

## Summary

hootOS is based on the latest ubuntu LTS with additional packages required for 
hootNAS, most notably ZFS.

hootOS is packaged as a BIOS/UEFI bootable ISO hybrid and runs entirely 
in-memory, and can optionally persist system changes to writable media. 
The advantage of such a system is that: 

* no installation is required
* simple and easy to upgrade
* boot from any media, even a slow USB-stick, or network
* True data and system OS separation 

## hootOS architecture

The in-memory capability and persistence is accomplished with the 
[live-boot](https://manpages.ubuntu.com/manpages/jammy/man7/live-boot.7.html) 
package.

In early userspace, live-boot searches for a filesystem[1] labled 
*persistence*. If found, any changes will be persisted to that filesystem.

The default network configuration is DHCP, see 
[build-syshoot.sh](./build-syshoot.sh) for details.

The script [network-config.sh](/tty/README.md) is executed on **first boot**, and
on the terminal screen, the user is welcomed with the IP address of the system. 
With this information, the user can connect to the system using SSH, or make 
webAPI calls, or open a browser and connect to the hootNAS management dashboard.

**On boot** the service `hootsrv.service` starts the webserver target 
[webserver.mjs](/webserver/webserver.mjs) which in turn starts the webapp 
target [index.html](/webapp/index.html).

## Building hootOS

A two step buildflow is used to create a hootOS ISO file.

### 1. Building the system

Before running the below command, you must as a minimum set the environment 
variable HOOT_REPO to point to the root of your local hootNAS git repository. 
check [build-syshoot.sh](./build-syshoot.sh) for other recomended, but optional 
settings.

    $ sudo build-syshoot.sh <projectname>

where `projectname` is the name of the subfolder that will be created, this 
will build the hootOS system in the `projectname/syshoot` directory. 

### 2. Building the hootOS iso file

Check that user variables in the 
[build-hootiso.sh](./build-hootiso.sh) file are according to your 
requirements.

```bash
$ sudo build-hootiso.sh <projectname> <newiso>
```
where `projectname` is an existing project directory, and `newiso` 
is the path and name of the new iso file to be built, the path must exist, any 
existing file will be overwritten.

the command does two things, first it will build an ISO image in the 
`projectname/isoimage` directory, then it will use the content of this 
directory to generate an hootOS ISO file.

### Modifying system-hoot after building

If you need to edit or debug the system you have built, the command 

```bash
$ sudo modify-syshoot.sh <projectname>
```
will login (chroot) on the system in the `projectname/syshoot` directory and 
present you with a system prompt, there you can make any changes you need. When 
you are done, type `exit` to end the session.

If you modify the system, you should also build a new iso image.

## Contributing

All contributors are required to sign the hootNAS Contributor License Agreement 
prior to contributing code to an open source repository. This process is 
handled automatically by [cla-assistant](https://cla-assistant.io/). 
Simply open a pull request and a bot will automatically check to see if you 
have signed the latest agreement. If not, you will be prompted to do so as part 
of the pull request process. 

This project operates under the [hootNAS Code of Conduct](#placeholder). By 
participating in this project you agree to abide by its terms. 

## Statement of Support

This software is provided as-is, without warranty of any kind or commercial 
support through hootNAS. See the associated license for additional details. 
Questions, issues, feature requests, and contributions should be directed to 
the community as outlined in the [hootNAS Community Guidelines](#placeholder).

## License

This is code is licensed under the Apache License 2.0. Full license is 
available [here](/LICENSE).

### Footnotes

[1]: live-boot does not support zfs in early userspace, therefore btrfs is used 
for persitence. As a future feature, zfs in early userspace could be
accomplished by a custom 
[initramfs hook](https://manpages.ubuntu.com/manpages/bionic/en/man8/initramfs-tools.8.html) 
or by modifying package zfs-initramfs. In either case live-boot has to be 
modified as well. Since initramfs documentation is rather abstruse, it might be 
an opportunity to move from initramfs to dracut, dracut-live and zfs-dracut.

## Placeholder

Placeholder for future content