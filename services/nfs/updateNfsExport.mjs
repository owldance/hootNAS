/**
 * Updates a nfsExport object in the nfs_exports table.
 * @module updateNfsExport
 * @typedef {import('../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { executeQueryRun } from '../db/executeQueryRun.mjs'

/**
 * Updates a NFS export in the database.
 * @param {NfsExport} nfsExport - The updated NFS export object.
 * @returns {Promise<QueryResult>} - A Promise that resolves with the result of the insert query.
 * @throws {Error} - If there is an error executing the insert query.
 */
export async function updateNfsExport(nfsExport) {
  try {
    // for each property of the nfsExport object, that is not undefined, 
    // add it to the fields and values arrays
    const fields = []
    const values = []
    for (const [key, value] of Object.entries(nfsExport)) {
      if (key != 'id' && value !== undefined) {
        fields.push(key)
        values.push(value)
      }
    }
    // create query string
    const query = `
    UPDATE nfs_exports
    SET ${fields.map((field) => `${field} = ?`).join(', ')}
    WHERE id = ${nfsExport.id}`
    const result = await executeQueryRun(query, values)
    return result
  } catch (e) {
    throw e
  }
}