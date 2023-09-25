/**
 * Controllers handle the request and call the services, which contain the 
 * fundamental technical logic. Controllers decide what to do with the data 
 * returned from the services, and then send the response back to the client.
 * @module controllers/shares
 */
'use strict'
import {
  _deleteJobById,
  _insertJob
} from "../services/schedule.mjs"
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'

export async function deleteJobById(req, res, next) {
  const { jobId } = req.body
  try {
    const queryResult  = await _deleteJobById(jobId)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}

export async function insertJob(req, res, next) {
  const { newJob } = req.body
  try {
    const queryResult = await _insertJob(newJob)
    res.status(201).send(queryResult)
    next()
  } catch (e) {
    res.status(500).send(getErrorObject(e)) //&& next(error)
  }
}


