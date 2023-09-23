/**
 * Selects all active jobs from the database
 * @module getJobs
 */
'use strict'
import { executeQueryAll, executeQueryRun } from './sqlite3-api-calls.mjs'

/**
 * A job 
 * @typedef {Object} Job
 * @property {number} id The unique ID of the job.
 * @property {number} user_id The ID of the user who owns the job.
 * @property {string} modified Date and time the job was modified by the user.
 * @property {string} created Date and time the job was created by user.
 * @property {string} name The name of the job.
 * @property {string} desc Description of the job.
 * @property {boolean} idle Whether the job is idle or not.
 * @property {string} script File name of the ES6 module to run
 * @property {string} run_on Shedueled Date and time to run the job.
 * @property {string} run_started Date and time when the job started running.
 * @property {string} run_ended Date and time when the job finished running.
 * @property {number} run_interval Interval at which to run the job
 * @property {string} run_data Data to pass to the job script
 * @property {string} run_message Message returned by the job script
 * @property {number} run_exit_code Exit code returned by the job script
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


/**
 * Updates a job in the job_queue table. id must be specified, if id = 0 then 
 * all jobs will be updated. For all other parameters, if null is passed, then
 * that parameter will not be updated.
 * @async
 * @function updateJobs
 * @param {number} id The ID of the job, if 0, all jobs will be updated.
 * @param {string|null} [event=null] If the value is 'online' or 'exit', the
 * run_started or run_ended column will be updated with the current datetime
 * @param {boolean|null} [idle=null] The status of the job.
 * @param {string|null} [message=null] The message associated with the job.
 * @param {number|null} [exit=null] The exit code of the job.
 * @returns {object} A object with the property `changes' indicating the 
 * number of rows updated.
 * @throws {Error} Throws an error if there was a problem updating the job.
 */
export async function updateJobs(id, event = null, idle = null, message = null,
  exitCode = null) {
  try {
    let sets = []
    if (event == 'online')
      sets.push(`run_started = datetime('now', 'localtime')`)
    if (event == 'exit')
      sets.push(`run_ended = datetime('now', 'localtime')`)
    if (idle !== null)
      sets.push(`idle = ${idle}`)
    if (message !== null) {
      message = message.replace(/'/g, "''").replace(/"/g, '""')
      sets.push(`run_message = '${message}'`)
    }
    if (exitCode !== null)
      sets.push(`run_exit_code = ${exitCode}`)
    let where = ''
    if (id != 0)
      where = `WHERE id = ${id}`
    const query = `UPDATE job_queue SET ${sets.join(', ')} ${where}`
    const result = await executeQueryRun(query)
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
