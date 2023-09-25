/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/devices
 */
import { getDevices, setupDevices } from '../services/devices.mjs'
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'
'use strict'

export async function getBlockDevices(req, res, next) {
  const { username, content } = req.body
  try {
    const result = await getDevices()
    res.status(201).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}
export async function initialSetup(req, res, next) {
  const { storagepool } = req.body
  try {
    const result = await setupDevices(storagepool)
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

