# hootNAS - Jobduler, a persistent job scheduler

 Jobduler executes scheduled jobs on a 'best effort' basis, meaning that exact 
 time of execution is not guaranteed, only that the job will be executed as 
 early as possible after the scheduled time. This limitation is due to the 
 database polling interval and the number of workers threads available. Jobs 
 are ordered and executed by ascending schedueled time i.e. oldest first.

**On boot** the service [jobduler.service](/scripts/jobduler.service) 
starts the jobduler target [jobduler.mjs](/scheduler/jobduler.mjs).

All jobs are stored in the database, which the jobduler service polls every
minute for jobs to run. The jobduler service will run the job if the job is
enabled. Each job has a corresponding ES6 module file in the 
[jobs directory](/scheduler/jobs/) which is the actual job code. 


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
