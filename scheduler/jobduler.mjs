/**
 * This is a module that is used to schedule jobs.
 * @module jobduler
 */
import { Worker } from 'worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout, setInterval } from 'timers'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import { getActiveJobs } from './queries/getJobs.mjs'
import { updateJobStatus } from './queries/updateJobStatus.mjs'

const jobsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)), '/jobs')

// callback functions for workers
function onWorkerMessage(event) {
    updateJobStatus(event.jobId, null, 'idle', event.msg)
}
function onWorkerOnline(event) {
    updateJobStatus(event.jobId, 'running')
}
function onWorkerExit(event) {
    console.log(`jobId ${event.jobId} exited with code ${event.code}`)
    updateJobStatus(event.jobId, true, 'idle', event.msg)
}
function onWorkerError(event) {
    updateJobStatus(event.jobId, false, 'idle', event.msg)
}
// spawn worker function
const spawnWorker = (job) => {
    const worker = new Worker(
        `${jobsPath}/${job.runjob}.mjs`, {
        name: `${job.runjob}`,
        workerData: JSON.parse(job.data)
    })
    //const threadId = worker.threadId
    worker.on('message', (message) => {
        onWorkerMessage({ jobId: job.id, msg: message })
    })
    worker.on('error', (e) => {
        onWorkerError({ jobId: job.id, msg: e.message })
    })
    worker.on('online', () => {
        onWorkerOnline({ jobId: job.id })
    })
    worker.on('exit', (xcode) => {
        // worker.threadId is out of scope here
        onWorkerExit({ jobId: job.id, code: xcode })
    })
}
// query database for active jobs
const activeJobs = await getActiveJobs()

// spawn workers for each active job
activeJobs.forEach((job) => {
    spawnWorker(job)
})




