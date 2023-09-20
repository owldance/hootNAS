import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'
import { getNfsExport } from '../queries/getNfsExport.mjs'  
import { updateNfsExportStatus } from '../queries/updateNfsExportStatus.mjs'

const nfs = await getNfsExport(workerData.nfs_exports_id)
parentPort.postMessage(`hello from worker ${threadId}`)

// parentPort.postMessage(JSON.stringify(workerData))
// generate random number between 2000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 2000 + 1) + 2000)
await setTimeout(randomTime)
await updateNfsExportStatus(workerData.nfs_exports_id, 'error')
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)