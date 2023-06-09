/**
 * Routers only chain together controller functions, no logic should go here
 * @module routes/index
 */
import express from 'express'
import * as user from '../controllers/users.mjs'
import * as devices from '../controllers/devices.mjs'
import * as system from '../controllers/system.mjs'
import { checkAuthorization } from '../utilities/authorize.mjs'
export const apiRouter = express.Router()
export const pubRouter = express.Router()

// just a test 
function requireToken(req, res, next) {
    console.log(req.body)
    const { accesstoken } = req.body
    if (accesstoken) {
        next()
    } else {
        res.status(403).send({ message: 'No token provided' })
    }
}

pubRouter.post('/getAccessToken', user.getAccessToken)
pubRouter.post('/verifyAccessToken', user.verifyAccessToken)
apiRouter.post('/getBlockDevices', devices.getBlockDevices)
apiRouter.post('/rebootSystem', system.rebootSystem)
apiRouter.post('/getSetupId', checkAuthorization, system.getSetupId)
apiRouter.post('/initialSetup', devices.initialSetup)

