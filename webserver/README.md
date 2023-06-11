# hootNAS - webserver

## webserver.mjs

**On boot** the service `hootsrv.service` starts the webserver target 
[webserver.mjs](./webserver.mjs) which in turn starts the webapp 
target [index.html](/webapp/dist/index.html).

The directory structure of the [webserver folder](/webserver/) is as follows: 

    📦webserver
    ┣ 📂routes
    ┣ 📂controllers
    ┗ 📂services

Routes only authorize and chain together controller functions, no other logic 
should go here. Controllers handle the request and call the services, and 
decide what to do with the data returned from the services, and then send the 
response back to the client. Services call various webapi's and handle the 
data returned, no experess.js context should be in the services.

## Contributing

All contributors are required to sign the hootNAS Contributor 
License Agreement prior to contributing code to an open source repository. This 
process is handled automatically by [cla-assistant](https://cla-assistant.io/). 
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
