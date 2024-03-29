/**
 * Selects a NFS export by id
 * @module selectNfsExportById
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
*/
'use strict'
import { executeQueryGet } from '../db/executeQueryGet.mjs'


/**
 * Selects NFS exports by id
 * @function selectNfsExportById
 * @async
 * @param {Number} Id export id
 * @returns {Promise<NfsExport>} on resolve
 * @throws {Error} on reject
 */
export async function selectNfsExportById(Id) {
  try {
    const query = `SELECT * FROM nfs_exports WHERE id = ${Id}`
    const result = await executeQueryGet(query)
    return result
  } catch (e) {
    throw e
  }
}