# hootNAS - The webapp

## Developing the webapp with Vue 3 in Vite

Development on your local machine is done by running the webserver on your
local machine, which then makes system calls via SSH to a hootNAS instance

VSCode is used as the IDE in this example, but any IDE will do.

1.  [Prepare your development environment](/documentation/prepare-development-environment.md).

2.  [Create and spin up a hootNAS instance](/documentation/create-hootnas-instance.md).

3.  Install the required npm packages by running this command in the 
    [webapp](/webapp) directory, this is a one-time operation:

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

6.  In the VSCode termninal start the web application by changing directory 
    to the [webapp](/webapp) directory and run the command:
    
    ```bash
    $ npm run dev
    ```
    You will now be able to access the web application on the URL given by the 
    above command. The web application will output debug information in the 
    browser console, which can be accessed by pressing `F12` in your browser.

6.  When you are done debugging, and want to commit the webapp to hootOS, 
    you must compile and minify the webapp by running the command:
    
    ```sh
    $ npm run build
    ```
    Next time you [build hootOS and hootISO](/hoot-os/README.md) the webapp 
    will be included there.

## Other useful Vue 3 commands

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)
```sh
npm run format
```