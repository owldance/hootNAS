/**
 * Routers only authorize and chain together controller functions, no logic
 * should go here
 * @module routes/index
 */
import express from 'express'
import * as user from '../controllers/users.mjs'
import * as devices from '../controllers/devices.mjs'
import * as system from '../controllers/system.mjs'
import * as shares from '../controllers/shares.mjs'
import * as schedule from '../controllers/schedule.mjs'
import { checkAuthorization } from './authorize.mjs'
export const apiRouter = express.Router()


apiRouter.post('/getAccessToken', user.getAccessToken)
apiRouter.post('/createAccount', user.createAccount)
apiRouter.post('/getBlockDevices',checkAuthorization, devices.getBlockDevices)
apiRouter.post('/rebootSystem', checkAuthorization, system.rebootSystem)
apiRouter.post('/shutdownSystem', checkAuthorization, system.shutdownSystem)
apiRouter.post('/getSetupId', checkAuthorization, system.getSetupId)
apiRouter.post('/isPersistenceActive', checkAuthorization, system.isPersistenceActive)
apiRouter.post('/initialSetup', checkAuthorization, devices.initialSetup)
apiRouter.post('/selectNfsExportByUserId', checkAuthorization, shares.selectNfsExportByUserId)
apiRouter.post('/insertNfsExport', checkAuthorization, shares.insertNfsExport)
apiRouter.post('/insertJob', checkAuthorization, schedule.insertJob)
apiRouter.post('/deleteJobById', checkAuthorization, schedule.deleteJobById)

