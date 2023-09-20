/**
 * Update the status of a job in the database
 * @module updateJob
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`


/**
 * Updates a job in the job_queue table. If null is passed for a parameter, 
 * that parameter will not be updated.
 * @async
 * @function updateJob
 * @param {number} id - The ID of the job to update.
 * @param {boolean|null} [success=null] - The success status of the job.
 * @param {string|null} [status=null] - The status of the job.
 * @param {string|null} [message=null] - The message associated with the job.
 * @param {number|null} [exit=null] - The exit code of the job.
 * @returns {object} - A object with the property `changes' indicating the 
 * number of rows updated.
 * @throws {Error} - Throws an error if there was a problem updating the job.
 */
export async function updateJob(id, success = null, status = null, 
  message = null, exit = null) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    let sets = []
    if (success !== null) 
      sets.push(`run_success = ${success}`)
    if (status !== null)
      sets.push(
        `status_id = (SELECT id FROM job_status WHERE status = '${status}')`
    )
    if (message !== null)
      sets.push(`run_message = '${message}'`)
    if (exit !== null)
      sets.push(`run_exit_code = ${exit}`)
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

// updateJob( 33, true, null, null)
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
