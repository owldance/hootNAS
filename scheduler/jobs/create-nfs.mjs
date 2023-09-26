/**
 * @module jobs/create-nfs
 * @typedef {import('../queries/nfs_extports.mjs').NfsExport} NfsExport
 */
import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { selectNfsExport } from '../../webapi/nfs/selectNfsExport.mjs'
import { updateNfsExport } from '../../webapi/nfs/updateNfsExport.mjs'

const nfsExport = await selectNfsExport(workerData.data.lastID)
parentPort.postMessage(`create-nfs ${nfsExport.user_name} in job id:${workerData.id}`)
console.log(`create-nfs ${nfsExport.user_name} in job id:${workerData.id}`)

// createZfs(`dpool/data/${nfsExport.user_name}`, 'X',
//     {
//         compression: 'lz4',
//         mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
//     }
// )

// if (nfsExport.all_squash) {
//     // all uids/gids are mapped to the anonymous uid/gid
//     // files on server must be owned by "nobody"
//     // chown nobody:nogroup /bzpool/share/herman-share
// }


// parentPort.postMessage(JSON.stringify(workerData))
// generate random number between 5000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
await setTimeout(randomTime)
await updateNfsExport({ 
    id: nfsExport.id, 
    status: 'enabled',
    path: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`,
    mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
})
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)