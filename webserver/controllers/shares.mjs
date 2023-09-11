/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/shares
 */
'use strict'
import { _selectNfsByUserId } from "../services/shares.mjs"
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'

export async function selectNfsByUserId(req, res, next) {
  const { userid } = req.body
  try {
    const shares = await _selectNfsByUserId(userid)
    res.status(201).send(shares)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

