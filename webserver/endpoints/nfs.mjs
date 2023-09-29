/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/shares  
 * @typedef {import('../../services/nfs/insertNfsExport.mjs').NfsExport} NfsExport
 * @typedef {import('../../services/nfs/selectNfsExportsByUserId.mjs').NfsExports} NfsExports
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
'use strict'
import { createNetworkFileShare as _createNetworkFileShare }
  from '../../services/nfs/createNetworkFileShare.mjs'
import { selectNfsExportsByUserId as _selectNfsExportsByUserId } 
  from '../../services/nfs/selectNfsExportsByUserId.mjs'
import { modifyNetworkFileShare as _modifyNetworkFileShare }
  from '../../services/nfs/modifyNetworkFileShare.mjs'
import { removeNetworkFileShare as _removeNetworkFileShare }
  from '../../services/nfs/removeNetworkFileShare.mjs'
import { getErrorObject } from '../../services/utilities/getErrorObject.mjs'

export async function selectNfsExportsByUserId(req, res, next) {
  const { user_id } = req.body
  try {
    const nfsExports = await _selectNfsExportsByUserId(user_id)
    res.status(201).send(nfsExports)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function createNetworkFileShare(req, res, next) {
  const { nfsExport } = req.body
  try {
    const queryResult = await _createNetworkFileShare(nfsExport)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function modifyNetworkFileShare(req, res, next) {
  const { nfsExport } = req.body
  try {
    const queryResult = await _modifyNetworkFileShare(nfsExport)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function removeNetworkFileShare(req, res, next) {
  const { id } = req.body
  try {
    const queryResult = await _removeNetworkFileShare(id)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}
