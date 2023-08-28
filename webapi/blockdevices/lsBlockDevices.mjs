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
 * @property {String} tran device transport type
 */

/**
 * Performs a lsblk device search excluding:
 *  1. usb devices
 *  2. holder devices or slaves e.g. partitions.
 * @async 
 * @function
 * @returns {Promise<Array<blockDevice>>} On resolve
 * @throws {Error} On reject
 */
export async function lsBlockDevices() {
  try {
    let lsblk = await shell(
      'lsblk -J -d -e7,11 -o KNAME,TYPE,PATH,FSTYPE,FSSIZE,SIZE,MOUNTPOINT,' +
      'PARTTYPE,PARTUUID,PARTLABEL,WWN,VENDOR,REV,TRAN'
    )
    
    lsblk = JSON.parse(lsblk)
    // delete devices where TRAN is "usb"
    lsblk.blockdevices = lsblk.blockdevices.filter(({ tran }) => tran !== 'usb')
    return lsblk
  }
  catch (e) {
    throw e
  }
}

//lsblk -J -d -e7,11 -o KNAME,TYPE,PATH,FSTYPE,FSSIZE,SIZE,MOUNTPOINT,PARTTYPE,PARTUUID,PARTLABEL,WWN,VENDOR,REV,TRAN