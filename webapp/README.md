# hootNAS - The webapp

## Developing the webapp with Vue 3 in Vite

Development on your local machine is done by running the webserver on your
local machine, which then makes system calls via SSH to a hootNAS instance

VSCode is used as the IDE in this example, but any IDE will do.

1.  [Prepare your development environment](/documentation/prepare-development-environment.md).

2.  [Create a hootNAS instance](/documentation/create-hootnas-instance.md).

3.  Install the required npm packages by running this command in the 
    `$webapp` directory:

    ```sh
    $ npm install
    ```

4.  Start the webserver in your local VSCode by pressing `F5`, or by selecting 
    `Debug -> Start Debugging` from the menu. This will start the webserver on 
    your local machine, which will make system calls via SSH to the running 
    hootNAS machine. The webserver will output debug information in the DEBUG 
    CONSOLE tab in VSCode. The webserver listens on port HTTP 80 when deployed, 
    and port 8000 in develpment mode.

5.  In the VSCode termninal start the web application by changing directory 
    to `$HOOT_REPO/webapp` and run the command
    
    ```bash
    $ npm run dev
    ```
    You will now be able to access the web application on the URL given by the 
    above command. The web application will output debug information in the
    TERMINAL tab in VSCode. See also [webapp/README.md](/webapp/README.md) for
    more information.

6.  When you are done debugging, and want to commit the webapp to hootOS, 
    you must compile and minify the webapp. Next time you 
    [build hootOS and hootISO](/hoot-os/README.md) the webapp will be included 
    there.
    
    ```sh
    $ npm run build
    ```

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