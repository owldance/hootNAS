# Adding new commandline parameters to live-boot

## Kernel parameters

```
linux   /live/vmlinuz boot=live noeject persistence quiet splash
```
Commandline parameters for live-boot are passed to the kernel, and are 
available in `/proc/cmdline` in the initramfs. The kernel passes unknown 
(to the kernel) parameters to userspace.

## Commandline parsing
The parameters are parsed in `9990-cmdline-old` in the function
`Cmdline_old ()`.

## Adding a new parameter
Adding a new parameter requires the appropriate modifications to the function
`Cmdline_old ()` in `9990-cmdline-old.sh`.

## Adding `persistence-zvol` parameter

```
    persistence-zvol=*)
        tmp_string="${_PARAMETER#persistence-zvol=}"
        ZPOOL="${tmp_string%%/*}"
        ZVOL="${tmp_string#*/}"
        export ZPOOL ZVOL
        ;;
```

