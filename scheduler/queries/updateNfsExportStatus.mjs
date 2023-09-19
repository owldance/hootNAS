/**
 * Update the status of an NFS export
 * @module updateNfsExportStatus
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`


export async function updateNfsExportStatus(id, status) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.run(
      `UPDATE nfs_exports
      SET status_id = (SELECT id FROM export_status WHERE status = '${status}') 
      WHERE id = ${id}`
    )
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

// getActiveJobs()
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
