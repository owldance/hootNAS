/**
 * Delete a job from the job queue by id
 * @module deleteJobById
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'


/**
 * Deletes a job from the job queue by its ID.
 * @async
 * @function deleteJobById
 * @param {number} id The ID of the job to be deleted.
 * @returns {Promise<QueryResult>} Object with the result of the query
 * @throws {Error} If there is an error executing the deletion query.
 */
export async function deleteJobById(id) {
  try {
    const query = `
        DELETE FROM job_queue 
        WHERE id = ${id}`
    const result = await executeQueryRun(query)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deleteJobById(7)
    .then((result) => {
      console.log(result)
    })
    .catch((e) => {
      console.log(e)
    })
}