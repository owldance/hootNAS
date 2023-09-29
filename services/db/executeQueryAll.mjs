/**
 * Executes a query and returns all the rows as an array of objects.
 * @module executeQueryAll
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
const dbFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../db/hoot.db')

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
      filename: dbFile,
      driver: sqlite3.Database
    })
    result = await db.all(query)
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

// run select test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  executeQueryAll('SELECT * FROM users').then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}
