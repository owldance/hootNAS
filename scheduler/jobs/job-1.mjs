import { parentPort, workerData } from 'node:worker_threads'
import process from 'node:process'
// import bree from '../app.mjs'

console.log('job-1 has started')
console.log(JSON.stringify(workerData.job.worker.workerData))
// signal to parent that the job is done
if (parentPort) parentPort.postMessage('done')
// eslint-disable-next-line unicorn/no-process-exit
else process.exit(0)