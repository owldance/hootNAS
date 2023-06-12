/**
 * Routers only authorize and chain together controller functions, no logic
 * should go here
 * @module routes/index
 */
import express from 'express'
import * as user from '../controllers/users.mjs'
import * as devices from '../controllers/devices.mjs'
import * as system from '../controllers/system.mjs'
import { checkAuthorization } from '../utilities/authorize.mjs'
export const apiRouter = express.Router()


apiRouter.post('/getAccessToken', user.getAccessToken)
apiRouter.post('/createAccount', user.createAccount)
apiRouter.post('/getBlockDevices',checkAuthorization, devices.getBlockDevices)
apiRouter.post('/rebootSystem', checkAuthorization, system.rebootSystem)
apiRouter.post('/getSetupId', checkAuthorization, system.getSetupId)
apiRouter.post('/initialSetup', checkAuthorization, devices.initialSetup)

