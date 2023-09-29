/**
 * Methods that gets various disk information
 * @module getBlockdevices
 */

'use strict'
import { humanReadableToNumber } from '../utilities/humanReadableToNumber.mjs'
import { lsBlockDevices } from './lsBlockDevices.mjs'
import { lsBlockDeviceWWIDs } from './lsBlockDeviceWWIDs.mjs'

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
 * Performs a lsblk blockdevice search. Also adds wwid's and converts postfixed 
 * string numerical values (e.g. 10G) to numbers. 
 * @async 
 * @function 
 * @returns {Promise<Array<blockDevice>>} On resolve
 * @throws {Error} On reject
 */
export async function getBlockDevices() {
  try {
    let blocks = await lsBlockDevices()
    // add wwid
    const wwid = await lsBlockDeviceWWIDs()
    // adds the first available wwid starting with "wwn" 
    // to it's respecitve blockdevice
    for (const block of blocks.blockdevices) {
      const mapwwid = wwid.map.find(({ wwid, kname }) =>
        kname === block.kname && wwid.match(/^virt|wwn|scsi|sata|pci/m)
      )
      // if no wwid is found, do not add it
      if (mapwwid) {
        console.log(`found wwid ${mapwwid.wwid}`)
        block.wwid = mapwwid.wwid
      }
      // convert postfixed values to ints e.g. "0.1M" to 100000 (bytes)
      block.fssize = humanReadableToNumber(block.fssize)
      block.size = humanReadableToNumber(block.size)
    }
    return blocks
  } catch (e) {
    throw e
  }
}
