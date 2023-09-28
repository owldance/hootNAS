/**
 * Inserts a job in the job queue.
 * @module insertJob
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'

/**
 * @typedef {Object} Job
 * @property {number} id - The ID of the job.
 * @property {number} user_id - The ID of the user who owns the job.
 * @property {string} modified - The date and time when the job was last modified. Default value: CURRENT_TIMESTAMP.
 * @property {string} created - The date and time when the job was created. Default value: CURRENT_TIMESTAMP.
 * @property {string|null} name - The name of the job. Default value: NULL.
 * @property {string|null} desc - The description of the job. Default value: NULL.
 * @property {boolean} idle - Whether the job is idle. Default value: TRUE.
 * @property {string} script - The script to run for the job.
 * @property {string|null} script_data - The data for the script. Default value: NULL.
 * @property {string} run_on - The date and time when the job should run. Default value: CURRENT_TIMESTAMP.
 * @property {number} run_interval - The interval at which the job should run, in seconds. Default value: 0.
 * @property {string|null} run_started - The date and time when the job started running. Default value: NULL.
 * @property {string|null} run_ended - The date and time when the job ended running. Default value: NULL.
 * @property {string|null} run_message - The message from the job run. Default value: NULL.
 * @property {number|null} run_exit_code - The exit code from the job run. Default value: NULL.
 */

/**
 * Creates a job in the job queue table.
 * @async
 * @function insertJob
 * @param {Job} job The job object containing the job details.
 * @returns {Promise<QueryResult>} The result of the query execution.
 * @throws {Error} If there is an error executing the query.
 */
export async function insertJob(job) {
  try {
    // for each property of the job object, that is not undefined, 
    // add it to the fields and values arrays
    const fields = []
    const values = []
    for (const [key, value] of Object.entries(job)) {
      if (value !== undefined) {
        fields.push(key)
        values.push(value)
      }
    }
    const query = `
        INSERT INTO job_queue (${fields.join(', ')}) 
        VALUES (${values.map((value) => '?').join(', ')})`
    const result = await executeQueryRun(query, values)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  insertJob({
    user_id: 1,
    name: 'test job',
    desc: 'test job description',
    script: 'test.mjs',
    script_data: '{"test": "test"}',
    run_interval: 0,
  })
    .then((result) => {
      console.log(result)
    })
    .catch((e) => {
      console.log(e)
    })
}

