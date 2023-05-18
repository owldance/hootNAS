/**
 * Methods that gets various disk information
 * @module lsBlockDeviceWWIDs
 */

'use strict'
import { shell } from '../utilities/shell.mjs'

/**
 * @typedef wwidToBlockDeviceMap
 * @type {Object}
 * @property {String} wwid device wwid
 * @property {String} kname internal kernel device name
 */
/**
 * Looks up WWID's for all blockdevices
 * @returns {Promise<Array<wwidToBlockDeviceMap>>} On resolve
 * @returns {Promise<Error>} On reject
 */
export async function lsBlockDeviceWWIDs() {
  const wwid = { map: [] }
  try {
    let wwidmap = await shell('ls -l /dev/disk/by-id')
    const regex = /(?<wwid>[\w:.-]*)\s->.+?(?<kname>[sv]d\w*)$/gm
    const matches = wwidmap.matchAll(regex)
    for (const match of matches) {
      wwid.map.push({ wwid: match[1], kname: match[2] })
    }
  } catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve(wwid)
}
