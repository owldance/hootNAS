/**
 * @module jobs/delte-nfs
 * @typedef {import('../queries/nfs_extports.mjs').NfsExport} NfsExport
 */
import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { deleteNfsExportById } from '../../webapi/nfs/deleteNfsExportById.mjs'

parentPort.postMessage(`delte-nfs ${workerData.data.nfsExport_id} in job id:${workerData.id}`)
console.log(`delte-nfs ${workerData.data.nfsExport_id} in job id:${workerData.id}`)


// parentPort.postMessage(JSON.stringify(workerData))
// generate random number between 5000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
await setTimeout(randomTime)
await deleteNfsExportById(workerData.data.nfsExport_id)
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)