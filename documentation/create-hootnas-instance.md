# hootNAS - Create and spin up a hootNAS instance

1.  [Create a hootNAS ISO image](/hoot-os/README.md), or just download 
    [latest ISO image releases](https://github.com/owldance/hootNAS/releases).
    
2.  Boot the image up in a virtual machine or on a physical machine with at 
    least three available disks, and then note the IP address displayed on the 
    terminal screen. 

    If you are using VMware, set `disk.EnableUUID="TRUE"` in the vmx 
    configuration file or in the vsphere configuration. If you are using 
    QEMU/KVM, make sure you are using virtual SCSI or SATA disk 
    (and not VirtIO), alternatively set a unique serial number on each virtual 
    disk using libvirt or qemu e.g.: 
    `-drive if=none,id=disk1,file=disk1.qcow2,serial=1234567890`

    ## Setup name resolution

3.  Add the IP address to your `/etc/hosts` file, e.g. if the IP address is 
    `192.168.22.48` then add the following line like this

    ```bash
    $ sudo echo "192.168.22.48    hootnas" >> /etc/hosts
    ```
    You can now access the frotend webapp using the URL `http://hootnas` in 
    your browser or log on with SSH:

    ```bash
    $ ssh root@hootnas
    ```
    The default `root` password is `pass1234`
    
    ## Setup SSH key authentication for development

4.  Generate a public/private rsa key pair, just accept the defaults by 
    pressing enter repeatedly, this will create the files `~/.ssh/id_rsa` and 
    `~/.ssh/id_rsa.pub`
    
    ```bash
    $ ssh-keygen -t rsa
    ```

5.  Copy the public key to the `hootnas` machine. This will prompt for 
    the root password, enter `pass1234` which is the default `root` password on 
    the hootNAS ISO image.
    
    ```bash
    $ ssh-copy-id root@hootnas
    ```
    
6.  Log on to the `hootnas` machine once, so that the machine is 
    automatically added to the local `~/.ssh/known_hosts` file.
    
    ```bash
    $ ssh root@hootnas
    ```

    You can now log on to the `hootnas` machine without ever entering a 
    single password. This is required for development.

7.  What you would ideally want to do now, unless you are developing the setup
    wizard itself, is to setup the storage using the setup wizard. You can do 
    this by accessing the setup wizard with your browser on the IP address or 
    hostname of the `hootnas` machine, e.g. `http://hootnas` or 
    `http://192.168.22.48`. The setup wizard will guide you through the
    process of setting up the storage, and should also create a user account 
    when given the opportunity by the wizard. 