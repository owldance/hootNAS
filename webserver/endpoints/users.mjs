/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/users
 */
import jwt from 'jsonwebtoken'
import { accessTokenSecret } from '../../webserver/webserver.mjs'
import { getErrorObject } from '../../services/utilities/getErrorObject.mjs'
import { insertUser } from '../../services/users/insertUser.mjs'
import { selectUser } from '../../services/users/selectUser.mjs'
'use strict'

/**
 * @typedef {Object} User
 * @property {number} id - The ID of the user.
 * @property {string} name - The name of the user.
 * @property {string} mail - The email address of the user.
 * @property {number} status_id - The ID of the status of the user.
 * @property {string} status - The status of the user.
 * @property {Array<String>} groups group names
 * @property {String} accesstoken jwt token
 */ 
 

export async function signIn(req, res, next) {
  const { name, password } = req.body
  try {
    const user = await selectUser(name, password)
    user.accesstoken = jwt.sign(user, accessTokenSecret)
    res.status(201).send(user)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function createAccount(req, res, next) {
  const { name, password, mail } = req.body
  try {
    await insertUser(name, password, mail)
    const user = await selectUser(name, password)
    user.accesstoken = jwt.sign(user, accessTokenSecret)
    res.status(201).send(user)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}