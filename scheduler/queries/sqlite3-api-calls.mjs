/**
 * Update the status of a job in the database
 * @module updateJobs
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`

/**
 * Executes the given SQL query using the 'run' method, suitable for UPDATE,
 * INSERT and DELETE queries.
 * @param {string} query A SQL query to execute.
 * @returns {Promise<object>} Object with the result of the query.
 * @throws {Error} In case of error executing the query or closing the database.
 */
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
 * Executes a query and returns all the rows as an array of objects.
 * @async
 * @function executeQueryAll
 * @param {string} query The SQL query to execute.
 * @returns {Promise<Array<Object>>} An array of objects.
 * @throws {Error} In case of error executing the query or closing the database.
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
 * Executes a query to retrieve a single row from the database.
 * @async
 * @function executeQueryGet
 * @param {string} query A SQL query to execute.
 * @returns {Promise<Object>} The retrieved row as an object.
 * @throws {Error} In case of error executing the query or closing the database.
 */
async function executeQueryGet(query) {
    try {
      let result = null
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      })
      result = await db.get(query)
      await db.close()
      return result
    } catch (e) {
      throw e
    }
  }