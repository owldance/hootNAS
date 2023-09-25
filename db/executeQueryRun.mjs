/**
 * Executes the given SQL query using the 'run' method
 * @module db/executeQueryRun
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
/** 
 * @const {string} dbFile Database full path and file name, relative to the
 * directory where this module is located.
 */
const dbFile = path.dirname(fileURLToPath(import.meta.url)) + '/hoot.db'

/**
 * The result object returned by the executeQueryRun function.
 * @typedef {Object} QueryResult
 * @property {Statement} stmt The SQLite statement object.
 * @property {number} lastID The ID of the last affected row.
 * @property {number} changes The number of rows affected by the query.
 */

/**
 * Executes the given SQL query using the 'run' method, suitable for UPDATE,
 * INSERT and DELETE queries.
 * @param {string} query A SQL query to execute.
 * @param {Array} queryParams Optional, an array of query parameters.
 * @returns {Promise<QueryResult>} Object with the result of the query.
 * @throws {Error} In case of error executing the query or closing the database.
 */
export async function executeQueryRun(query, queryParams = []) {
  try {
    console.log('executeQueryRun')
    let result = null
    const db = await open({
      filename: dbFile,
      driver: sqlite3.Database
    })
    result = await db.run(query, queryParams)
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}
