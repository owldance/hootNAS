/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/system
 */
import { rebootSystem as _rebootSystem } from '../../webapi/system/rebootSystem.mjs'
import { shutdownSystem as _shutdownSystem } from '../../webapi/system/shutdownSystem.mjs'
import { getSetupId as _getSetupId} from '../../webapi/system/getSetupId.mjs'
import { isPersistenceActive as _isPersistenceActive } from '../../webapi/system/isPersistenceActive.mjs'
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'
'use strict'

export async function rebootSystem(req, res, next) {
  const { username, content } = req.body
  try {
    const result = await _rebootSystem()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}
 
export async function shutdownSystem(req, res, next) {
  const { username, content } = req.body
  try {
    const result = await _shutdownSystem()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function getSetupId(req, res, next) {
  try {
    const result = await _getSetupId()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function isPersistenceActive(req, res, next) {
  try {
    const result = await _isPersistenceActive()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}