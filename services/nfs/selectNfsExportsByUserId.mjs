/**
 * Selects NFS shares
 * @module selectNfsExportsByUserId
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
*/
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`

/**
 * @typedef {Array<NfsExport>} NfsExports
 */

/**
 * Selects NFS exports by id
 * @function selectNfsExportsByUserId
 * @async
 * @param {Number} userId user id
 * @returns {Promise<NfsExports>} on resolve
 * @throws {Error} on reject
 */
export async function selectNfsExportsByUserId(userId) {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    const exports = await db.all(
      `SELECT nfs_exports.*
      FROM nfs_exports
      WHERE user_id = ${userId}`
    )
    const table_info = await db.all(
      `SELECT name, type FROM pragma_table_info('nfs_exports')`)
    await db.close()
    // if a property identifies as boolean, convert its value to Boolean
    exports.forEach((share) => {
      table_info.forEach((info) => {
        if (info.type == 'BOOLEAN') {
          if (share[info.name] == 0)
            share[info.name] = false
          else if (share[info.name] == 1)
            share[info.name] = true
        }
      })
    })
    return exports
  } catch (e) {
    throw e
  }
}