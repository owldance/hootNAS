/**
 * Inserts a job in the job queue.
 * @module insertJob
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'

/**
 * @typedef {Object} NewJob
 * @property {number} user_id The ID of the user who owns the job.
 * @property {string} name The name of the job. Default: undefined.
 * @property {string} desc The description of the job. Default: undefined.
 * @property {string} script The script to be executed for the job.
 * @property {string} script_data The data to be passed to the script.Default: undefined.
 * @property {string} run_on The date and time when the job should be run. Default: current date and time.
 * @property {number} run_interval The interval at which the job should be run. Default: 0 (run once).
 */
/**
 * Creates a job in the job queue table.
 * @async
 * @function insertJob
 * @param {NewJob} job The job object containing the job details.
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

