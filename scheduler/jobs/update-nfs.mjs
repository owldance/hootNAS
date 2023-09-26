/**
 * @module jobs/update-nfs
 * @typedef {import('../queries/nfs_extports.mjs').NfsExport} NfsExport
 */
import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { updateNfsExport } from '../../webapi/nfs/updateNfsExport.mjs'

parentPort.postMessage(`update-nfs ${workerData.data.id} in job id:${workerData.id}`)
console.log(`update-nfs ${workerData.data.id} in job id:${workerData.id}`)
console.log(JSON.stringify(workerData.data))

// parentPort.postMessage(JSON.stringify(workerData))
// generate random number between 5000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
await setTimeout(randomTime)
await updateNfsExport(workerData.data) 
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)