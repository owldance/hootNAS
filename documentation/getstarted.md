# hootNAS - Getting started

## Status of the project

The hootNAS ISO image can presently boot up satisfactory and present an IP 
address on the terminal. The web application is available at 
`http://<IP address>` and can perform a basic setup of the storage, when done a 
placeholder for the management app is displayed. The API is implemented in
so far as it can be called from the webserver and perform basic operations 
related to the storage setup. 

## Prepare your development environment

1.  Clone this repository to your local machine, either by downloading the zip 
    file or by using the git command:
    
    ```bash
    $ git clone https://github.com/owldance/hootNAS.git
    ```

2.  Create a environment variable called `HOOT_REPO` that points to the 
    cloned repository. This variable must also be available for `root` user, 
    it recommended to add it to your `/etc/environment` file, so that it is 
    available every time you open a terminal. This is used by the various 
    scripts etc. to find the source files.

    ```bash
    $ sudo echo "HOOT_REPO=/path/to/hootNAS" >> /etc/environment
    ```

    Make sure to log in/out or run `source /etc/environment` to make the
    variable available in your current terminal.


3.  Check the script 
    [getting-started.sh](./getting-started.sh) first, then run it to prepare 
    your local development environment. This will install the required
    dependencies e.g. node.js, npm packages, debian packages, etc. it will also
    set optional environment variables.

    ```bash
    $ sudo $HOOT_REPO/getting-started.sh
    ```
    Then run /etc/environment file with the 'dot space' command to make the 
    variables available in your current terminal, or log in/out.
    
    ```bash
    $ . /etc/environment
    ```

## Start developing hootNAS with Vue 3 in Vite

1.  Create a hootNAS ISO image following [this guide](/hoot-os/README.md), or
    download 
    [latest ISO image releases](https://github.com/owldance/hootNAS/releases).
    
    Boot the image up in a virtual machine or on a physical machine with at 
    least two available disks, and then note the IP address displayed on the 
    terminal screen. 

    If you are using VMware, set `disk.EnableUUID="TRUE"` in the vmx 
    configuration file or in the vsphere configuration. If you are using 
    QEMU/KVM, make sure you are using virtual SCSI or SATA disk 
    (and not VirtIO), alternatively set a unique serial number on each virtual 
    disk using libvirt or qemu e.g.: 
    `-drive if=none,id=disk1,file=disk1.qcow2,serial=1234567890`

2.  Add the IP address to your `/etc/hosts` file, e.g. if the IP address is 
    `192.168.22.48` then add the following line like this

    ```bash
    sudo echo "192.168.22.48    hootnas" >> /etc/hosts
    ```
    make sure to log in/out to make the hostname available in your current 
    terminal.

    Generate a public/private rsa key pair, just accept the defaults by 
    pressing enter repeatedly, this will create the files `~/.ssh/id_rsa` and 
    `~/.ssh/id_rsa.pub`
    
    ```bash
    ssh-keygen -t rsa
    ```

    Copy the public key to the `hootnas` machine. This will prompt for 
    the root password, enter `pass1234` which is the default on the hootNAS 
    ISO image.
    
    ```bash
    ssh-copy-id root@hootnas
    ```
    
    Log on to the `hootnas` machine once, so that the machine is 
    automatically added to `~/.ssh/known_hosts` file.
    
    ```bash
    ssh root@hootnas
    ```

    Now you can log on to the `hootnas` machine without ever entering a 
    single password. During development on your local machine, this is used by 
    the webserver to make system calls via SSH to the running hootNAS machine.

3.  Start the webserver in your local VSCode by pressing `F5`, or by selecting 
    `Debug -> Start Debugging` from the menu. This will start the webserver on 
    your local machine, which will make system calls via SSH to the running 
    hootNAS machine. The webserver will output debug information in the DEBUG 
    CONSOLE tab in VSCode.

4.  Start the web application by changing directory to `$HOOT_REPO/webapp` and 
    run the command
    
    ```bash
    $ npm start dev
    ```

    You will now be able to access the web application on the URL given by the 
    above command. The web application will output debug information in the
    TERMINAL tab in VSCode. See also [webapp/README.md](/webapp/README.md) for
    more information.
    
    


