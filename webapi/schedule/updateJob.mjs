/**
 * Updates a job in the job queue.
 * @module updateJob
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertJob.mjs').Job} Job
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'

/**
 * Updates a job in the job queue table. If id=0 then all jobs will be updated.
 * @async
 * @function updateJob
 * @param {Job} job A subset of Job object properties to update.
 * @returns {Promise<QueryResult>} The result of the query execution.
 * @throws {Error} If there is an error executing the query.
 */
export async function updateJob(job) {
  try {
    // for each property of the nfsExport object, that is not undefined, 
    // add it to the fields and values arrays
    const fields = []
    const values = []
    for (const [key, value] of Object.entries(job)) {
      if (key != 'id' && value !== undefined) {
        fields.push(key)
        values.push(value)
      }
    }
    // create query string
    let where = ''
    if (job.id > 0) {
      where = `WHERE id = ${job.id}`
    }
    const query = `
    UPDATE job_queue
    SET ${fields.map((field) => `${field} = ?`).join(', ')}
    ${where}`
    const result = await executeQueryRun(query, values)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateJob({
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

