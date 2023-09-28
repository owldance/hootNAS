/**
 * @module schedule/selectIdleJobs
 * @typedef {import('./insertJob.mjs').Job} Job
 */
'use strict'
import { executeQueryAll } from '../../db/executeQueryAll.mjs'
/**
 * Retrieves all jobs with status 'idle' from the job_queue table.
 * @async
 * @function selectIdleJobs
 * @returns {Promise<Array<Job>} An array of job objects with status 'idle'.
 * @throws {Error} If there is an error retrieving the jobs from the database.
 */
export async function selectIdleJobs() {
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

  // run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    selectIdleJobs().then((result) => {
      console.log(result)
    }).catch((e) => {
      console.log(e)
    })
  }