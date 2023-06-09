/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/system
 */
import { reboot, getSetup } from '../services/system.mjs'
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'
'use strict'

export async function rebootSystem(req, res, next) {
  const { username, content } = req.body
  try {
    const result = await reboot()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}


export async function getSetupId(req, res, next) {
  try {
    const result = await getSetup()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}
