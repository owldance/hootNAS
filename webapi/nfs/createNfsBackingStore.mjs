/**
 * @module nfs/createNfsBackingStore
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { selectNfsExportById } from './selectNfsExportById.mjs'
import { updateNfsExport } from './updateNfsExport.mjs'

parentPort.postMessage(`${import.meta.url}`)

/** @type {NfsExport} */
const nfsExport = await selectNfsExportById(workerData.data.id)
parentPort.postMessage(`createNfsBackingStore ${nfsExport.id} in job id:${workerData.id}`)

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


// generate random number between 5000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
await setTimeout(randomTime)
await updateNfsExport({ 
    id: nfsExport.id, 
    status_id: 3,
    path: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`,
    mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
})

process.exit(0)