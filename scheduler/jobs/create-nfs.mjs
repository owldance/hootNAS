/**
 * @module jobs/create-nfs
 * @typedef {import('../queries/nfs_extports.mjs').NfsExport} NfsExport
 */
import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { getNfsExport, updateNfsExportStatus } from '../queries/nfs_exports.mjs'
import { createZfs } from '../zfs/createZfs.mjs'

const nfsExport = await getNfsExport(workerData.data.nfs_exports_id)
parentPort.postMessage(`hello from ${nfsExport.user_name} in job id:${workerData.id}`)
console.log(`hello from ${nfsExport.user_name} in job id:${workerData.id}`)

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
await updateNfsExportStatus({ 
    id: nfsExport.id, 
    status: 'enabled',
    path: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`,
    mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
})
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)