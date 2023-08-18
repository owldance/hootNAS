# Adding logging to live-boot

## Debugging in early userspace

`live-boot` does accept a commandline parameter `debug`, but it's of very 
limited use. The scripts use LSB init script functions e.g. 
`log_warning_msg` and `log_failure_msg`, and the ouput of these end up on the 
terminal, but not in the kernel log or in `journald`. Filming the terminal 
screen while loads of debug messages whizzing by with a camera is not a viable 
option.

There are two alternative options for debugging `live-boot` or any other 
scripts:

1. Writing to the kernel log using
```
    echo "<7>whatever: A message from early userspace" > /dev/kmsg
```
Where the number in the angle brackets is the kernel log level. This produces 
perfectly formatted kernel log messages with a timestamp, that are available 
in `journald` and `dmesg`.

2. Writing to a file in the `/run` directory, e.g. `/run/live` 
```
    echo "A message from early userspace" >> /run/live/boot-live.log
```
This allows for large amounts of data to be logged.

Based on the above, a new function `live_debug_log ()` has been implemented in 
`0010-debug`, it creates a file `/run/live/boot-live.log` which can be examined 
in userspace. Since the file resides in `/run/live` it is not persistent, and 
will be discarded on every reboot.

References:

[https://elinux.org/Debugging_by_printing](https://elinux.org/Debugging_by_printing)

[https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html](https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html)
