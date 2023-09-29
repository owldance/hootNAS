# hootNAS - webserver

## webserver.mjs

**On boot** the service `hootsrv.service` starts the webserver target 
[webserver.mjs](./webserver.mjs). The webserver listens on port HTTP 80 when 
deployed, and port 8000 in develpment mode.

## API Endpoints
The endpoints are defined in the [endpoints directory](/webserver/endpoints) 
which contains a module for each category of [application services](/services) 
that ties the exposed endpoints together with the appropriate service.

Api requests are routed through [api-router.mjs](/webserver/api-router.mjs) 
which is also responsible for authorisation. Authorisation is currently done 
on a user group membership basis, and is defined in 
[api-authorize.mjs](/webserver/api-authorize.mjs) in the `authRequired` object. 
[JSON Web Tokens](https://jwt.io/) (JWT) are used as the authorisation vehicle.


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
