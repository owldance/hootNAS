/**
 * Selects all active jobs from the database
 * @module getJobs
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`


export async function getActiveJobs() {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.all(
      `SELECT * 
      FROM job_queue 
      WHERE status_id = (SELECT id FROM job_status WHERE status = 'active')`
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
