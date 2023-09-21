/**
 * Update the status of a job in the database
 * @module updateJobs
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`


async function executeQueryRun(query) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.run(query)
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

/**
 * Updates a job in the job_queue table. If null is passed for a parameter, 
 * that parameter will not be updated.
 * @async
 * @function updateJobs
 * @param {number} id - The ID of the job, if 0, all jobs will be updated.
 * @param {boolean|null} [idle=null] - The status of the job.
 * @param {string|null} [message=null] - The message associated with the job.
 * @param {number|null} [exit=null] - The exit code of the job.
 * @returns {object} - A object with the property `changes' indicating the 
 * number of rows updated.
 * @throws {Error} - Throws an error if there was a problem updating the job.
 */
export async function updateJobs(id, idle = null, message = null, exitCode = null) {
  try {
    let where = ''
    if (id != 0)
      where = `WHERE id = ${id}`
    let sets = []
    if (idle !== null)
      sets.push(
        `idle = ${idle}`
      )
    if (message !== null){
      // escape single and double quotes
      message = message.replace(/'/g, "''").replace(/"/g, '""')
      sets.push(`run_message = '${message}'`)
    }
    if (exitCode !== null)
      sets.push(`run_exit_code = ${exitCode}`)
    let query = `UPDATE job_queue SET ${sets.join(', ')} ${where}`
    const result = await executeQueryRun(query)
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
