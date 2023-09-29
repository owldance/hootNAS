/**
 * Routers only authorize and chain together controller functions, no logic
 * should go here
 * @module routes/index
 */
import express from 'express'
import * as users from './endpoints/users.mjs'
import * as devices from './endpoints/devices.mjs'
import * as system from './endpoints/system.mjs'
import * as nfs from './endpoints/nfs.mjs'
import { checkAuthorization } from './api-authorize.mjs'
const apiRouter = express.Router()

apiRouter.post('/getAccessToken', users.getAccessToken)
apiRouter.post('/createAccount', users.createAccount)
apiRouter.post('/getBlockDevices',checkAuthorization, devices.getBlockDevices)
apiRouter.post('/rebootSystem', checkAuthorization, system.rebootSystem)
apiRouter.post('/shutdownSystem', checkAuthorization, system.shutdownSystem)
apiRouter.post('/getSetupId', checkAuthorization, system.getSetupId)
apiRouter.post('/isPersistenceActive', checkAuthorization, system.isPersistenceActive)
apiRouter.post('/initialSetup', checkAuthorization, devices.initialSetup)
apiRouter.post('/nfs/selectNfsExportsByUserId', checkAuthorization, nfs.selectNfsExportsByUserId)
apiRouter.post('/nfs/createNetworkFileShare', checkAuthorization, nfs.createNetworkFileShare)
apiRouter.post('/nfs/modifyNetworkFileShare', checkAuthorization, nfs.modifyNetworkFileShare)
apiRouter.post('/nfs/removeNetworkFileShare', checkAuthorization, nfs.removeNetworkFileShare)

export default apiRouter
