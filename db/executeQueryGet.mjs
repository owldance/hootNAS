/**
 * Executes a query to retrieve a single row from the database.
 * @module executeQueryGet
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`
/**
 * Executes a query to retrieve a single row from the database.
 * @async
 * @function executeQueryGet
 * @param {string} query A SQL query to execute.
 * @returns {Promise<Object>} The retrieved row as an object.
 * @throws {Error} In case of error executing the query or closing the database.
 */
export async function executeQueryGet(query) {
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