/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/system
 */
'use strict'
import { rebootSystem as _rebootSystem }
  from '../../services/system/rebootSystem.mjs'
import { shutdownSystem as _shutdownSystem }
  from '../../services/system/shutdownSystem.mjs'
import { isPersistenceActive as _isPersistenceActive }
  from '../../services/system/isPersistenceActive.mjs'
import { getErrorObject }
  from '../../services/utilities/getErrorObject.mjs'

export async function rebootSystem(req, res, next) {
  try {
    const result = await _rebootSystem()
    res.status(200).send(result)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function shutdownSystem(req, res, next) {
  try {
    const result = await _shutdownSystem()
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