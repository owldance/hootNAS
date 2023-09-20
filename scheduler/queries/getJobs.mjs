/**
 * Selects all active jobs from the database
 * @module getJobs
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`

/**
 * A job 
 * @typedef {Object} Job
 * @property {number} id - The unique ID of the job queue.
 * @property {number} user_id - The ID of the user who owns the job queue.
 * @property {number} status_id - The ID of the status of the job queue.
 * @property {string} modified - The date and time the job queue was last modified by the user.
 * @property {string} created - The date and time the job queue was created.
 * @property {string} name - The name of the job queue.
 * @property {string} desc - The description of the job queue.
 * @property {string} run_job - The file name without extenstion of the ES6 module to run
 * @property {string} run_on - The date and time to run the job in the job queue.
 * @property {number} run_interval - The interval at which to run the job in the job queue.
 * @property {string} run_data - The data to pass to the job when it runs in the job queue.
 * @property {string} run_message - The message returned by the job when it runs in the job queue.
 * @property {boolean} run_success - Whether the job ran successfully in the job queue.
 * @property {number} run_exit_code - The exit code returned by the job when it runs in the job queue.
 */

/**
 * An array of job objects
 * @typedef {Array<Job>} Jobs
 */

/**
 * Retrieves all jobs with status 'idle' from the job_queue table.
 * @async
 * @function getIdleJobs
 * @returns {Promise<Jobs>} An array of job objects with status 'idle'.
 * @throws {Error} If there is an error retrieving the jobs from the database.
 */
export async function getIdleJobs() {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.all(
      `SELECT * 
      FROM job_queue 
      WHERE status_id = (SELECT id FROM job_status WHERE status = 'idle')`
    )
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

// getIdleJobs()
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
