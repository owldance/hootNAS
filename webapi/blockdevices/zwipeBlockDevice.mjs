/**
 * Wipe filesystem signatures on a blockdevice, then zapp all partitions.
 * All data will be lost forever.
 * @module zwipeBlockDevice
 * @todo ensure swap partitions are not in use: swapoff --all
 * @todo for flash-based storage, if the disk was previously used, 
 * do a full-disk discard (TRIM/UNMAP), which can improve performance:
 * blkdiscard -f $DISK
 * @todo if the disk was previously in an MD array: 
 * apt install --yes mdadm
 * # See if one or more MD arrays are active:
 * cat /proc/mdstat
 * # If so, stop them (replace 'md0' as required):
 * mdadm --stop /dev/md0
 * mdadm --zero-superblock --force $DISK
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Wipe filesystem signature on a blockdevice, then zapp all partitions
 * @function zwipeBlockDevice
 * @async
 * @param {String} blockDevice full path to the blockdevice
 * @returns {Promise<Error>} On reject
 * @returns {Promise} On resolve
 */
export async function zwipeBlockDevice(blockDevicePath) {
  try {
    await shell(`wipefs -af ${blockDevicePath}`)
    await shell(`sgdisk --zap-all ${blockDevicePath}`)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve()
}