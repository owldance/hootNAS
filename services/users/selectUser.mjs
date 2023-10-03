/**
 * Selects a user and group memberships from the database
 * @module selectUser
 */
'use strict'
import { executeQueryAll } from '../db/executeQueryAll.mjs'
/**
 * @typedef {Object} User
 * @property {number} id - The ID of the user.
 * @property {string} name - The name of the user.
 * @property {string} mail - The email address of the user.
 * @property {number} status_id - The ID of the status of the user.
 * @property {string} status - The status of the user.
 * @property {Array<String>} groups group names
 */
/**
 * Selects a user and group memberships from the database
 * @function selectUser
 * @async
 * @param {String} name 
 * @param {String} password 
 * @returns {Promise<User>} on resolve
 * @throws {Error} on reject
 */
export async function selectUser(name, password) {
  try {
    let result = await executeQueryAll(
      `SELECT users.* , user_status.status, groups."group"
      FROM users
      INNER JOIN user_groups ON users.id = user_groups.user_id 
      INNER JOIN groups ON user_groups.group_id = groups.id 
      INNER JOIN user_status ON users.status_id = user_status.id
      WHERE name ='${name}' AND password='${password}'`
    )
    if (result.length === 0) {
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
    return result
  } catch (e) {
    throw e
  }
}