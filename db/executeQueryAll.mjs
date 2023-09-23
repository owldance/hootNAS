/**
 * Executes a query and returns all the rows as an array of objects.
 * @module executeQueryAll
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`
/**
 * Executes a query and returns all the rows as an array of objects.
 * @async
 * @function executeQueryAll
 * @param {string} query The SQL query to execute.
 * @returns {Promise<Array<Object>>} An array of objects.
 * @throws {Error} In case of error executing the query or closing the database.
 */
export async function executeQueryAll(query) {
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
