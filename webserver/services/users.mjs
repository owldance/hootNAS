/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/index
 */

import jwt from 'jsonwebtoken'
import { selectUser } from '../../webapi/db/selectUser.mjs'
const accessTokenSecret = 'youraccesstokensecret'


export async function getAccessToken(username, password) {
  const user = await selectUser(username)
  try {
    if (user) {
      console.log('getAccessToken', username, password)
      const accessToken = jwt.sign({
        username: user.name, mail: user.mail, groups: ['admin', 'user'] 
      }, accessTokenSecret)
      return accessToken
    } else {
      throw new Error('Username or password incorrect')
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

export function verifyAccessToken(accessToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, accessTokenSecret, (err, payload) => {
      if (err){
        reject(new Error(err))
      }
      else
        resolve(payload)
    })
  })
}