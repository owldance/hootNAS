/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/shares
 * @typedef {import('../../webapi/nfs/insertNfsExport.mjs').NfsExport} NfsExport
 * @typedef {import('../../webapi/nfs/selectNfsExportsByUserId.mjs').NfsExports} NfsExports
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
import { selectNfsExportsByUserId } from '../../webapi/nfs/selectNfsExportsByUserId.mjs'
import { insertNfsExport } from '../../webapi/nfs/insertNfsExport.mjs'

export async function _selectNfsExportsByUserId(userId) {
  try {
    /** @typedef {NfsExports} nfsExports */
    const nfsExports = await selectNfsExportsByUserId(userId)
    return nfsExports
  } catch (e) {
    throw e
  }
}

export async function _insertNfsExport(nfsExport) {
  try {
    /** @typedef {QueryResult} queryResult */
    const queryResult = await insertNfsExport(nfsExport)
    return queryResult
  } catch (e) {
    throw e
  }
}