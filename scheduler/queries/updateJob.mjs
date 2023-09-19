/**
 * Update the status of a job in the database
 * @module updateJob
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`


export async function updateJob(id, success = null, status = null, message = null) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    let sets = []
    if (success !== null) 
      sets.push(`success = ${success}`)
    if (status !== null)
      sets.push(`status_id = (SELECT id FROM job_status WHERE status = '${status}')`)
    if (message !== null)
      sets.push(`message = '${message}'`)
    const set = sets.join(', ')
    result = await db.run(
      `UPDATE job_queue
      SET ${sets.join(', ')} 
      WHERE id = ${id}`
    )
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

updateJob( 33, true, null, null)
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })
