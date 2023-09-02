# hootNAS - Documentation

1. Development
    - [Prepare your development environment](/documentation/prepare-development-environment.md) - 
    If you want to start contribute to the project.
    - [Developing the webapp](/webapp/README.md) - If you want to work with 
    frontend JS with Vue 3 in Vite.
    - [Developing the webapi](/webapi/README.md) - If you want to work with 
    backend JS with node.js.
    - [Developing hootOS](/hoot-os/README.md) - If you want to work with 
    OS development.
    - [live-boot](/live-boot/README.md) - The things that makes hootOS run 
    in-memory
    - [Scripts](/scripts/README.md) - Bash scripts used by hootOS software.
    - [Database](/db/README.md) - The state management database

2. General concepts
    - [Create a hootNAS instance](/documentation/create-hootnas-instance.md) - 
    Get hootNAS up and running in no time.
    - [hootNAS architecture and boot process](/hoot-os/architecture-and-boot-process.md) - 
    A detailed description of the hootOS architecture and boot process.
    - [ZFS concepts](./zfs-concepts.md) - A brief introduction to ZFS concepts 
    and definition of terms.

3. Technical notes
    - [Create a BIOS/UEFI hybrid ubuntu boot disk](/documentation/tech/create-bios-uefi-hybrid-boot-disk.md) - 
    A guide to creating a ubuntu boot disk that can boot both BIOS and UEFI systems.
    - [SATA hot-plug support for hardware](/documentation/sata-hot-plugging.md) - 
    Design hardware for SATA hot-plug support.

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
