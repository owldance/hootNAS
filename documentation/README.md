# hootNAS - Documentation

1. Development
    - [Getting started](/documentation/getstarted.md) - Get up and running 
    reasonably quick.

2. General concepts
    - [hootNAS architecture and boot process](/hoot-os/architecture-and-boot-process.md) - A detailed description of the hootOS architecture and boot process.
    - [ZFS concepts](./zfs-concepts.md) - A brief introduction to ZFS concepts 
    and definition of terms.

3. The hootNAS operating system
    - [hootOS](/hoot-os/README.md) - on which the hootNAS software runs.
    - [live-boot](/live-boot/README.md) - The things that makes hootNAS run 
    in-memory

4. hootNas software
    - [Web server](/webserver/README.md) - The hootNAS webserver, which serves 
    the hootNAS webapp and api.
    - [Web app](/webapp/README.md) - The hootNAS webapp, which is the user 
    interface.
    - [Web API](/webapi/README.md) - The hootNAS API, which is the interface 
    to the api.
    - [Scripts](/scripts/README.md) - Bash scripts used by the
    hootNAS software.
    - [Database](/db/README.md) - The state management database

5. Technical blogs
    - [Create a BIOS/UEFI hybrid ubuntu boot disk](./tech/create-bios-uefi-hybrid-boot-disk.md) - A guide to creating a ubuntu boot disk that can boot both BIOS and UEFI systems.

## Writing documentation

The documentation consist of two types of information, 
code comments, using [JSDoc](https://jsdoc.app/index.html) format for 
Javascript code, and 
[bash code comments](https://www.shell-tips.com/bash/comments/). Markdown 
files are additionally used to outline general concepts that require 
elaboration that would not be meaningful to include in code, or to give a 
summary, or direct instructions e.g. a "how to".

## Grand unification

Currently, the missing part is a grand unified script that can compile a static 
documentation website using e.g. [Eleventy](https://www.11ty.dev/), from Vue, 
bash, JSDoc code comments, and markdown files.

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
the community as outlined in the [hootNAS Community 
Guidelines](#placeholder).

## License

This is code is licensed under the Apache License 2.0. Full license is 
available [here](../LICENSE).

## Placeholder

Placeholder for future content
