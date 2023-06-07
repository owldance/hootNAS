/**
 * Routers only chain together controller functions, no logic should go here
 * @module routes/index
 */
import express from 'express'
import * as user from '../controllers/users.mjs'
import * as devices from '../controllers/devices.mjs'
import * as system from '../controllers/system.mjs'
export const apiRouter = express.Router()
export const pubRouter = express.Router()

pubRouter.post('/login', user.login)
apiRouter.post('/verify', user.verify)
apiRouter.post('/getBlockDevices', devices.getBlockDevices)
apiRouter.post('/rebootSystem', system.rebootSystem)
apiRouter.post('/getSetupId', system.getSetupId)
apiRouter.post('/initialSetup', devices.initialSetup)

