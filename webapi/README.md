# hootNAS - webapi

The webapi consists of js modules containing methods which can be called by the 
webserver. 

## Developing the webapi

VSCode is used as the IDE in this example, but any IDE will do.

1.  [Prepare your development environment](/documentation/prepare-development-environment.md).

2.  [Create a hootNAS instance](/documentation/create-hootnas-instance.md).

3.  Install the required npm packages by running this command in the 
    `webapi` directory:

    ```sh
    $ npm install
    ```

4.  Start the webserver in your local VSCode by pressing `F5`, or by selecting 
    `Debug -> Start Debugging` from the menu. This will start the webserver on 
    your local machine, which will make system calls via SSH to the running 
    hootNAS machine. The webserver will output debug information in the DEBUG 
    CONSOLE tab in VSCode. The webserver listens on port HTTP 80 when deployed, 
    and port 8000 in develpment mode.

5.  Make API-calls with you favorite API development tool, such as 
    [Insomnia](https://insomnia.rest/), or [hoppscotch](https://hoppscotch.io/)
    which can be downloaded for local use.


