/**
 * Methods that gets various disk information
 * @module lsBlockDevices
 */

'use strict'
import { shell } from '../utilities/shell.mjs'

/**
 * @typedef blockDevice
 * @type {Object}
 * @property {String} kname internal kernel device name
 * @property {String} type device type
 * @property {String} path path to the device node
 * @property {Number} fstype filesystem type
 * @property {Number} fssize  filesystem size
 * @property {String} size  size of the device
 * @property {String} mountpoint  where the device is mounted
 * @property {String} parttype  partition type uuid
 * @property {String} partuuid  partition uuid
 * @property {String} partlabel  partition label
 * @property {String} wwn  unique storage identifier
 * @property {String} vendor  device vendor
 * @property {String} rev  device revision
 * @property {String} wwid device wwid
 */

/**
 * Performs an lsblk device search. 
 * @async 
 * @function
 * @returns {Promise<Array<blockDevice>>} On resolve
 * @returns {Promise<Error>} On reject  
 */
export async function lsBlockDevices() {
  let lsblk = null
  try {
    lsblk = await shell(
      'lsblk -J -e7,11 -o KNAME,TYPE,PATH,FSTYPE,FSSIZE,SIZE,MOUNTPOINT,' +
      'PARTTYPE,PARTUUID,PARTLABEL,WWN,VENDOR,REV'
    )
    lsblk = JSON.parse(lsblk)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve(lsblk)
}

