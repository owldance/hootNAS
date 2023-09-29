# hootNAS - Application services

The services consists of js modules containing methods which can be called by 
other modules, directly from the command line, or the webserver. 

## Developing the Application services

VSCode is used as the IDE in this example, but any IDE will do.

1.  [Prepare your development environment](/documentation/prepare-development-environment.md).

2.  [Create and spin up a hootNAS instance](/documentation/create-hootnas-instance.md).

3.  Install the required npm packages by running this command in the 
    [services](/services/) directory, this is a one-time operation:

    ```sh
    $ npm install
    ```
4.  If you have not modified the [launch.json](/.vscode/launch.json) file, you 
    can start the webserver in your local VSCode by pressing `Crtl-Shift-D` and 
    select `Webserver` from the dropdown RUN AND DEBUG menu. This will start 
    the webserver on your local machine, which will make system calls via SSH 
    to the running hootNAS machine. The webserver will output debug information 
    in the DEBUG CONSOLE tab in VSCode. The webserver listens on port HTTP 80 
    when deployed, and port 8000 in develpment mode.

5.  As above, but select `Jobduler` from the dropdown RUN AND DEBUG menu. This 
    will start the [jobduler service](/scheduler/jobduler.mjs) on your local 
    machine. The jobduler service will output debug information in the DEBUG 
    CONSOLE tab in VSCode.

6.  Make API-calls with you favorite API development tool, such as 
    [Insomnia](https://insomnia.rest/), or [hoppscotch](https://hoppscotch.io/)
    which can be downloaded for local use. Or you can start up the 
    [webapp](/webapp/README.md).


