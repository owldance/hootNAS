/**
 * Delete a NFS export by id
 * @module deleteNfsExportById
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
*/
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'


/**
 * Deletes NFS exports by id
 * @function deleteNfsExportById
 * @async
 * @param {Number} Id export id
 * @returns {Promise<QueryResult>} on resolve
 * @throws {Error} on reject
 */
export async function deleteNfsExportById(Id) {
  try {
    const query = `DELETE FROM nfs_exports WHERE id = ${Id}`
    const result = await executeQueryRun(query)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deleteNfsExportById(6)
    .then((result) => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
}