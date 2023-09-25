/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/schedule
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('../../webapi/schedule/insertJob.mjs').NewJob} NewJob
 */
import { deleteJobById } from '../../webapi/schedule/deleteJobById.mjs'
import { insertJob } from '../../webapi/schedule/insertJob.mjs'

/**
 * Deletes a job by its ID.
 * @async
 * @function _deleteJobById
 * @param {number} jobId - The ID of the job to delete.
 * @returns {Promise<QueryResult>} - The result of the delete operation.
 * @throws {Error} - If there was an error deleting the job.
 */
export async function _deleteJobById(jobId) {
  try {
    /** @typedef {QueryResult} queryResult */
    const queryResult = await deleteJobById(jobId)
    return queryResult
  } catch (e) {
    throw e
  }
}

/**
 * Inserts a job into the database.
 * @async
 * @function _insertJob
 * @param {NewJob} job - The job to be inserted.
 * @returns {Promise<QueryResult>} - The result of the insert query.
 * @throws {Error} - If there is an error inserting the job.
 */
export async function _insertJob(job) {
  try {
    /** @typedef {QueryResult} queryResult */
    const queryResult = await insertJob(job)
    return queryResult
  } catch (e) {
    throw e
  }
}