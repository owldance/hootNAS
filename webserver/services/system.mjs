/**
 * Services call various api's and handle the data returned. no experessjs 
 * context should be in the services.
 * @module services/system
 */
'use strict'
import { rebootSystem } from '../../webapi/system/rebootSystem.mjs'
import { shutdownSystem } from '../../webapi/system/shutdownSystem.mjs'
import { getSetupId } from '../../webapi/system/getSetupId.mjs'
import { isPersistenceActive } from '../../webapi/system/isPersistenceActive.mjs'

export async function reboot() {
  try {
    return await rebootSystem()
  } catch (e) {
    throw e
  }
}

export async function shutdown() {
  try {
    return await shutdownSystem()
  } catch (e) {
    throw e
  }
}

export async function getSetup() {
  try {
    return await getSetupId()
  } catch (e) {
    throw e
  }
}

export async function checkPersistence() {
  try {
    return await isPersistenceActive()
  } catch (e) {
    throw e
  }
}
