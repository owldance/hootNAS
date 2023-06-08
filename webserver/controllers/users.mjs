/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/index
 */
import { getJwt, verifyAccessToken } from '../services/users.mjs'
'use strict'

export async function getAccessToken(req, res, next) {
  const { name, password } = req.body
  try {
    const user = await getJwt(name, password)
    res.status(201).send(user)
    next()
  } catch (e) {
    res.status(500).send({ message: e.message }) //&& next(error)
  }
}

export async function verify(req, res, next) {
  const { accesstoken } = req.body
  try {
    const payload = await verifyAccessToken(accesstoken)
    res.status(200).send(payload)
    next()
  } catch (e) {
    res.status(500).send(e) //&& next(error)
  }
}