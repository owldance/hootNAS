/**
 * Services call various api's and handle the data returned. no experessjs 
 * context should be in the services.
 * @module services/devices
 */
'use strict'
import { getBlockDevices } from '../../webapi/blockdevices/getBlockDevices.mjs'
import { initialSetup } from '../../webapi/blockdevices/initialSetup.mjs'

export async function getDevices() {
  try {
    return await getBlockDevices()
  } catch (e) {
    throw e
  }
}
export async function setupDevices(storagepool) {
  try {
    return await initialSetup(storagepool)
  } catch (e) {
    throw e
  }
}

 