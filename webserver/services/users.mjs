/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/index
 */

import jwt from 'jsonwebtoken'
import { selectUser } from '../../webapi/db/selectUser.mjs'
const accessTokenSecret = 'youraccesstokensecret'


export async function getJwt(username, password) {
  try {
    const user = await selectUser(username, password)
    user.jwt = jwt.sign(user, accessTokenSecret)
    return user
  } catch (e) {
    throw e
  }
}

export function verifyAccessToken(accessToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, accessTokenSecret, (err, payload) => {
      if (err) {
        reject(new Error(err))
      }
      else
        resolve(payload)
    })
  })
}