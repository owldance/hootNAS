# hootOS - in-memory ubuntu

A detailed description of the hootOS architecture and boot process is available
[here](/hoot-os/architecture-and-boot.md).

## Building hootNAS

A three step buildflow is used to create a hootOS ISO file.

### Building the base system

1.  This is a one-time operation, create a working directory e.g. `work` 
    and `cd` into it. 
    
    Then run the script [build-base.sh](/hoot-os/build-baseos.sh) to build 
    the base system. 

    ```bash
    $ sudo build-baseos.sh
    ```
    This will create a directory `baseos` containing the base system i.e. a
    full (minimal) ubuntu installation. This is done to speed up the 
    development process, as the base system only needs to be built once.

    You now have the following directory structure:
    ```
    ..
    └── work
        └── baseos
    ```
    ### Building hootOS

2.  Then run the script 
    [build-hootos.sh](/hoot-os/build-hootos.sh) to build hootOS. 

    ```bash
    $ sudo build-hootos.sh test-build 
    ```

    This will build hootOS in the following directory structure:
    
    ```
    ..
    └── work
        ├── baseos
        └── test-build
            ├── hootos
            ├── staging
            └── source
    ```
    The script mounts the host and overlayfs filesystems, and builds the system 
    in the `hootos` directory. The overlayfs is used to speed up the build 
    process and save disk space. 
 
    You can create any number of build directories, each build directory will
    have its own `hootos`, `staging` and `source` directories, but they will 
    all share the same `baseos` directory.

    The `source` directory is used to store the script files that were used 
    for this particualar build, which sometimes can be very helpful when 
    debugging the scripts.

    overlayfs is basically a COW (copy-on-write) filesystem, `baseos` directory 
    is read-only, all changes are made in the `staging` directory, and `baseos` 
    and `staging` are then merged into `hootos`. `hootos` appears empty when 
    the build is done, to review and edit the contents, see #3 here below.

    ### Review and editing the hootOS build

3.  When desired, you can review or edit the built hootos system by running the 
    script [edit-hootos.sh](/hoot-os/edit-hootos.sh). 

    ```bash
    $ sudo edit-hootos.sh mount test-build/hootos
    ```
    when `mount` is specified, the script will mount the overlayfs and host 
    filesystems to `test-build/hootos`, and you can then `chroot` into the 
    hootos system:
    ```
    $ sudo chroot test-build/hootos
    ```
    ```
    $ sudo chroot test-build/hootos /usr/bin/env bash --login
    ```
    The first method you will simply present you with an interactive hootos
    system prompt. The second method will first go through the login process.
    
    In either case you can review or make any changes you need, and when you 
    are done, type `exit 0` to end the session. Then run this script again 
    with the `umount` command to unmount the filesystems.

    ```bash
    $ sudo edit-hootos.sh umount test-build/hootos
    ```
 
    ### Building the hootISO

4.  When you are satisfied with the hootOS build, you can build the hootISO by
    running the script [build-hootiso.sh](/hoot-os/build-hootiso.sh).

    ```bash
    $ sudo build-hootiso.sh test-build test.iso
    ```
    
    Which will result in the following directory structure:
    ```
    ..
    └── work
        ├── baseos
        └── test-build
            ├── hootos
            ├── staging
            ├── source
            ├── isoimage
            └── test.iso
    ```
    The `isoimage` directory contains all the files that are copied into 
    the ISO file. The `test.iso` file is the final ISO file, ready to be
    copied to a USB-stick, booted in a virtual machine, or for PXE booting.

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

## Placeholder

Placeholder for future content