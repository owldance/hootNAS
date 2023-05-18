/**
 * Create required partitions on a blockdevice
 * @module createPartitions
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Create required partitions. All partitions must be created before the
 * persistance btrfs raid is created, otherwise, for any subsequent created
 * partitions on the same blockdevice, the partition table on the device 
 * will be written, but the device manager will not update /dev directory 
 * even after a reboot.
 * @function createPartitions
 * @async
 * @param {String} blockDevice Full path to the blockdevice
 * @param {String} zfsPartName Optional, name of the zfs partition
 * @returns {Promise<Error>} On reject
 * @returns {Promise} On resolve
 */
export async function createPartitions(blockDevicePath, zfsPartName = '') {
  try {
    // partition for persistance
    await shell(`sgdisk -n1:1M:+2G -t1:8300 ${blockDevicePath}`)
    await shell(`sgdisk -c1:persistence ${blockDevicePath}`)
    // partition for zfs
    await shell(`sgdisk -n2:0:0 -t2:BF01 ${blockDevicePath}`)
    if (zfsPartName) await shell(`sgdisk -c2:${zfsPartName} ${blockDevicePath}`)
    // wait for udev to settle
    await shell(`udevadm settle --timeout 20`)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve()
}