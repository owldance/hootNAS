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
 * @property {number} id - The unique ID of the job.
 * @property {number} user_id - The ID of the user who owns the job.
 * @property {string} modified - Date and time the job was modified by the user.
 * @property {string} created - Date and time the job was created by user.
 * @property {string} name - The name of the job.
 * @property {string} desc - Description of the job.
 * @property {boolean} idle - Whether the job is idle or not.
 * @property {string} script - File name of the ES6 module to run
 * @property {string} run_on - Date and time to run the job in the job queue.
 * @property {number} run_interval - Interval at which to run the job
 * @property {string} run_data - Data to pass to the job script
 * @property {string} run_message - Message returned by the job script
 * @property {number} run_exit_code - Exit code returned by the job script
 */

/**
 * An array of job objects
 * @typedef {Array<Job>} Jobs
 */

async function executeQueryAll(query) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.all(query)
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

/**
 * Retrieves all jobs with status 'idle' from the job_queue table.
 * @async
 * @function getIdleJobs
 * @returns {Promise<Jobs>} An array of job objects with status 'idle'.
 * @throws {Error} If there is an error retrieving the jobs from the database.
 */
export async function getIdleJobs() {
  try {
    const query = `SELECT * 
    FROM job_queue 
    WHERE idle = 1 
    AND run_on < datetime('now', 'localtime') 
    AND run_interval != 0 OR run_exit_code IS NULL
    ORDER BY run_on ASC`
    const result = await executeQueryAll(query)
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
