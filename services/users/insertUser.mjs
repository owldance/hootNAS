/**
 * Inserts a user and group memberships in the database
 * @module insertUser
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
 * Inserts a user and group memberships in the database
 * @function insertUser
 * @async
 * @param {String} name 
 * @param {String} password 
 * @param {String} mail
 * @returns {Promise<Number>} lastID on resolve, the user id of the newly created user
 * @returns {Error} on reject
 */
export async function insertUser(name, password, mail) {
  let db = null
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    // insert user
    const user = await db.run(
      `INSERT INTO "users" ("name", "password", "mail", "status_id") 
      VALUES ('${name}', '${password}', '${mail}', 
      (SELECT id FROM user_status WHERE status = 'active'));`
    )
    // insert user group membership
    const group = await db.run(
      `INSERT INTO "user_groups" ("user_id", "group_id") 
      VALUES ((SELECT id FROM users WHERE "name" = '${name}'), 
          (SELECT id FROM groups WHERE "group" = 'users'));`
    )
    await db.close()
    return user.lastID
  } catch (e) {
    await db.close()
    throw e
  }
}

// insertUser('Monkeyx', 'monk7y', 'monkey@mail.mex')
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
