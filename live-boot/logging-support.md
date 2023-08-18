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
```bash
    echo "<7>whatever: A message from early userspace" > /dev/kmsg
```
Where the number in the angle brackets is the kernel log level. This produces 
perfectly formatted kernel log messages with a timestamp, that are available 
in `journald` and `dmesg`.

2. Writing to a file in the `/run` directory, e.g. `/run/live` 
```bash
    echo "A message from early userspace" >> /run/live/boot-live.log
```
This allows for large amounts of data to be logged.

Based on the above, a new function `live_debug_log ()` has been implemented in 
`0010-debug`, it logs debug messages to `/run/live/boot-live.log` and optionally 
to the kernel log if the message starts with `live-boot:`. The logfile can 
be examined in userspace, and since it is not persistent, it will be discarded 
on every reboot.

A variable `indent_tracker=0` has been added to `0001-init-vars.sh` which is 
set to keep track of the indentation level in the logfile. Therefore when 
logging inside a function, it is important that both function entry and all 
exits are marked with BEGIN and END respectively.

### Example logging

```bash
 live_debug_log "source-filename.sh: myfunction BEGIN"
    ...
    live_debug_log "This is a log message"
    live_debug_log "live-boot:This is a kernel log message"
    ...
 live_debug_log "source-filename.sh: myfunction END"
```



References:

[https://elinux.org/Debugging_by_printing](https://elinux.org/Debugging_by_printing)

[https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html](https://lists.ubuntu.com/archives/foundations-bugs/2021-November/463901.html)
