/**
 * Wipe filesystem signatures on a blockdevice, then zapp all partitions.
 * All data will be lost forever.
 * @module zwipeBlockDevice
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