# hootNAS

## A NAS appliance based on ubuntu LTS and ZFS

hootNAS comes with a web based management application and API based on a ubuntu 
LTS, it is packaged in two versions, one with hardware drivers for running on 
bare metal, and one for running in a virtual machine.

**Download** 
[latest ISO image releases](https://github.com/owldance/hootNAS/releases)

The ambition of hootNAS is to be a robust, utilitarian, user, and developer 
friendly NAS that can be used out-of-the-box, or customized to make it 
your very own. Although the intended use cases are individuals, academic 
organizations and small to medium businesses, with high data volumes, home 
users might also find it useful as they can add any functionality they need.

hootNAS accomplishes this by using ubiquitous technology, tools and frameworks 
etc. to curb context switching and trivial tasks, thus enabling the developer 
to focus more on solving actual problems and prevent developer fatigue. 
Additionally there is an emphasis on providing a quality documentation, in 
particular adding context, reasoning and references.

## Features

* Runs in-memory, no installation required
* Simple setup and easy to upgrade
* Boot from any media, even a slow USB-stick, or network
* True data and system OS separation 
* Local authentication, or remote LDAP or Active Directory servers
* SMB, NFS and iSCSI network folders and blockdevices
* Industrial grade ZFS storage
* Management dashboard web application
* API for custom or automated management

The in-memory operation is partially inspired by [SmartOS](https://smartos.org/)


## DEV STACK
![Dev stack](/documentation/assets/devstack.png "Dev stack")

The devlopment stack consists of [node.js](https://nodejs.org/en) 
and [bash](https://www.gnu.org/software/bash/) for backend 
interfacing, [Express.js](https://expressjs.com/) for serving the API and web 
application, the latter built using [Vite.js](https://vitejs.dev/) and 
[Vue.js](https://vuejs.org/) with [Bootstrap](https://getbootstrap.com/) 
components, and [JSDoc](https://jsdoc.app/index.html) for JS documentation. 

## TECH STACK
![Tech stack](/documentation/assets/techstack.png "Tech stack")

The technology stack consists of 
[ubuntu LTS version](https://ubuntu.com/about/release-cycle) as the base OS, 
[OpenZFS](https://openzfs.org/wiki/Main_Page) for storage, 
[SAMBA](https://www.samba.org/), 
[Linux-NFS](https://linux-nfs.org/wiki/index.php/Main_Page) and 
[Open-iSCSI](https://www.open-iscsi.com/) for serving storage, LDAP and 
Active Directory clients for authentication, and SQLite for state management.

## Where to go from here

* [Getting started](/documentation/getstarted.md) - Get up and running in no 
time, also contains the current status of the project.
* [Documentation](/documentation/README.md) - The documentation is a work in 
progress.

## Contributing

It is the hope that this project one day will become a community effort, 
eventually striking a reasonable balance between ["complete" and "nothingness 
forever"](https://2.bp.blogspot.com/-HAtcif46SpY/WBlep4MQmNI/AAAAAAAACtw/fRSGRUJQEEgEBpQmBOXZ6Mwe0PvwcsjUwCLcB/s1600/how_long_it_takes_to_complete_a_task.gif). Therefore all contributions are welcome, including issue reports and 
feature requests.

In the meantime all contributors are required to sign the hootNAS Contributor 
License Agreement prior to contributing code to an open source repository. This 
process is handled automatically by [cla-assistant](https://cla-assistant.io/). 
Simply open a pull request and a bot will automatically check to see if you 
have signed the latest agreement. If not, you will be prompted to do so as part 
of the pull request process. 

This project operates under the [hootNAS Code of Conduct](#placeholder). By 
participating in this project you agree to abide by its terms. 

The name hootNAS is a temporary placeholder, and is subject to change to 
something more techy once the project is more mature.

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
