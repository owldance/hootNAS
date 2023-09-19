import { parentPort, workerData, threadId } from 'node:worker_threads'
import process from 'node:process'
import { setTimeout } from 'timers/promises'

//parentPort.postMessage(`${workerData.worker} has started with threadId: ${threadId}`)
parentPort.postMessage(JSON.stringify(workerData))
// generate random number between 2000 and 10000
const randomTime = Math.floor(Math.random() * (10000 - 2000 + 1) + 2000)
await setTimeout(randomTime)
//parentPort.postMessage(`${workerData.worker} has done its job`)

process.exit(0)