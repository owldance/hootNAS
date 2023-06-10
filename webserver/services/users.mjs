/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/users
 */
import jwt from 'jsonwebtoken'
import { selectUser } from '../../webapi/db/selectUser.mjs'
import { accessTokenSecret } from '../../webserver/webserver.mjs'

/**
 * @typedef {Object} User
 * @property {String} name
 * .... etc 
 * @property {Array<String>} groups group names
 */
/**
 * Selects a user and group memberships from the database and returns a user 
 * object with a accesstoken property
 * @function getJwt
 * @async
 * @param {String} name 
 * @param {String} password 
 * @returns {User} on resolve
 * @returns {Error} on reject
 */
export async function getJwt(username, password) {
  try {
    const user = await selectUser(username, password)
    user.accesstoken = jwt.sign(user, accessTokenSecret)
    return user
  } catch (e) {
    e.exit = 1
    throw e
  }
}
