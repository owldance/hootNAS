# hootNAS - Prepare your development environment

Before starting development, it is recommended to read about the hootOS 
architecture and boot process [here](/hoot-os/architecture-and-boot.md).

## Prepare your development environment

1.  Clone or fork this repository to your local machine
    
    ```bash
    $ git clone https://github.com/owldance/hootNAS.git
    ```

2.  Check the script 
    [prepare-development-environment.sh](/documentation/prepare-development-environment.sh) 
    first, perhaps you would want to make some changes. Then run 
    it to prepare your local development environment, it will install the 
    required dependencies e.g. node.js, npm packages, debian packages, etc. it 
    will also set environment variables.

    ```bash
    $ sudo ./prepare-development-environment.sh  <hootnas-repo>
    ```
    where `hootnas-repo` is the full path to your local hootNAS git repository
    echo "e.g. /home/username/hootNAS", this path will be used to set the 
    important `$HOOT_REPO` variable in your '/etc/environment' file.

    Then log in/out to make the variables available system wide.





