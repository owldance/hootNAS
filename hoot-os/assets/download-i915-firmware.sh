#!/bin/bash

# firmware required by live-boot when building hootos with parameter 
# build=virtual
#
# download the drivers listed in missing-firmware.txt
# and add them in a tar.gz file
mkdir i915
for i in $(cat missing-i915-firmware.txt | grep -oE '[^/]+\.bin'); do
    wget -P i915 https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/tree/i915/$i 
done    
tar -czvf i915-firmware.tar.gz i915



