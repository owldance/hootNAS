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

const jobsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)), '/jobs')

// callback functions for workers
function onWorkerMessage(event){
    console.log(`message: ${event.threadId}: ${event.msg}`)
}
function onWorkerOnline(event){
    console.log(`status: ${event.threadId}: ${event.msg}`)
}
function onWorkerError(event){
    console.log(`error: ${event.threadId}: ${event.msg}`)
}
// spawn worker function
const spawnWorker = (job) => {
    const worker = new Worker(
        `${jobsPath}/${job.job}.mjs`, {
            name: `${job.job}`,
            workerData: JSON.parse(job.data)
        })
    const threadId = worker.threadId
    worker.on('message', (message) => {
        onWorkerMessage({threadId: threadId, msg: message})
    })
    worker.on('error', (e) => { 
        onWorkerError({threadId: threadId, msg: e})})
    worker.on('online', () => { 
        onWorkerOnline({threadId: threadId, msg: 'online'})})
    worker.on('exit', (code) => {
        onWorkerOnline({threadId: threadId, msg: 'offline'})})
}
// query database for active jobs
const activeJobs = await getActiveJobs()

// spawn workers for each active job
activeJobs.forEach((job) => {
    spawnWorker(job)
})




