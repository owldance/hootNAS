/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/shares
 */
'use strict'
import {
  _selectNfsExportByUserId,
  _insertNfsExport
} from "../services/shares.mjs"
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'

export async function selectNfsExportByUserId(req, res, next) {
  const { userid } = req.body
  try {
    const nfsExports = await _selectNfsExportByUserId(userid)
    res.status(201).send(nfsExports)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function insertNfsExport(req, res, next) {
  const { userid, nfsExport } = req.body
  try {
    const queryResult = await _insertNfsExport(nfsExport)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}


