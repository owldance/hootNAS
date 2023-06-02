/**
 * Create required partitions on a blockdevice. All blockdevices in a hootnas 
 * must have two partitions: first partition of 2GB is reserved for 
 * persistance, and the rest of the device is for zfs.
 * @module createPartitions
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Create required partitions. All partitions must be created before the
 * persistance btrfs raid is created, otherwise, for any subsequent created
 * partitions on the same blockdevice, the partition table on the device 
 * will be written to the device, but the device manager udev will not update 
 * /dev directory, even after a reboot.
 * @function createPartitions
 * @async
 * @param {String} blockDevicePath Full path to the blockdevice
 * @param {String} partName1 Name of the first partition
 * @param {String} partName2 Name of the second partition
 * @returns {Promise<Error>} On reject
 * @returns {Promise} On resolve
 */
export async function createPartitions(blockDevicePath, 
  partName1 = '', partName2= '') {
  try {
    // partition for persistance
    await shell(`sgdisk -n1:1M:+2G -t1:8300 ${blockDevicePath}`)
    if (partName1)
      await shell(`sgdisk -c1:${partName1} ${blockDevicePath}`)
    // partition for zfs
    await shell(`sgdisk -n2:0:0 -t2:BF01 ${blockDevicePath}`)
    if (partName2)
      await shell(`sgdisk -c2:${partName2} ${blockDevicePath}`)
    // wait for udev to settle
    await shell(`udevadm settle --timeout 20`)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve()
}