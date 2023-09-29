/**
 * Selects a user and group memberships from the database
 * @module selectUser
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`
/**
 * @typedef {Object} User
 * @property {String} name
 * .... etc 
 * @property {Array<String>} groups group names
 */
/**
 * Selects a user and group memberships from the database
 * @function selectUser
 * @async
 * @param {String} name 
 * @param {String} password 
 * @returns {User} on resolve
 * @throws {Error} on reject
 */
export async function selectUser(name, password) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.all(
      `SELECT users.* , user_status.status, groups."group"
      FROM users
      INNER JOIN user_groups ON users.id = user_groups.user_id 
      INNER JOIN groups ON user_groups.group_id = groups.id 
      INNER JOIN user_status ON users.status_id = user_status.id
      WHERE name ='${name}' AND password='${password}'`
    )
    if (result.length === 0) {
      await db.close()
      throw new Error('Username or password incorrect')
    }
    // create array of groups
    const groups = result.map((item) => {
      return item.group
    })
    // use first item in result as the user object, as they are all the same 
    // except for the group. delete the group property and add the groups array
    result = result[0]
    delete result.group
    // don't return the password
    delete result.password
    result.groups = groups
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

// selectUser('Monkey', 'monk7y')
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
