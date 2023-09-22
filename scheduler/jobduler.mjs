/**
 * This is a module that executes scheduled jobs on a 'best effort' basis, 
 * meaning exact time of execution is not guaranteed, only that the job will
 * be executed as early as possible after the scheduled time. This limitation 
 * is due to the database polling interval and the number of workers threads 
 * available. Jobs are ordered and executed by ascending schedueled time i.e. 
 * oldest first.
 * 
 * @module jobduler
 * @todo implement retry on error
 * @typedef {import('./queries/job_queue.mjs').Job} Job
 * @typedef {import('./queries/job_queue.mjs').Jobs} Jobs
 */
'use strict'
import { Worker } from 'worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout, setInterval } from 'timers'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import { getIdleJobs, updateJobs } from './queries/job_queue.mjs'

/** @const {Number} maxWorkers max number of simultaneous workers */
const maxWorkers = 2 
/** @const {Number} pollInterval interval to poll for idle jobs */
const pollInterval = 5000 
/** @var {Number} intervalId id of the polling timer */
let intervalId // id of the polling timer
/** @const {Number} runningWorkers number of workers running */
let runningWorkers = 0 
/** @const {String} jobsPath path to the jobs directory */
const jobsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)), '/jobs')

// reset all jobs to idle on startup
// this is to ensure a known state on startup, in case of abnormal shutdown
await updateJobs(0, 'startup', true, null, null)


/**
 * Spawns a worker to run a job.
 * @function spawnWorker
 * @async
 * @param {Job} job - The job object to run.
 */
const spawnWorker = async (job) => {
        // append .mjs, if not already present
        if (!job.script.endsWith('.mjs'))
            job.script += '.mjs'
        // spawn a worker
        const worker = new Worker(
            `${jobsPath}/${job.script}`, {
            name: `${job.script}`,
            workerData: {
                data: JSON.parse(job.run_data), 
                id: job.id
            }
        })
        // configure worker event handlers
        worker.on('online', () => {
            updateJobs(job.id, 'online', false, null, null)
        })
        worker.on('message', (message) => {
            updateJobs(job.id, 'message', null, message, null)
        })
        worker.on('error', (e) => {
            // uncaught exception, worker is terminated
            // log the error message
            updateJobs(job.id, 'error', null, e.message, null)
        })
        worker.on('exit', (exitCode) => {
            // if process.exit(exitCode) was called, the exitCode is passed
            // if the worker was terminated, then exitCode=1
            runningWorkers--
            updateJobs(job.id, 'exit', true, null, exitCode)
        })
}


function startQueue() {
    intervalId = setInterval(async () => {
        const idleJobs = await getIdleJobs()
        // spawn workers for each idle job
        idleJobs.forEach((job) => {
            if (runningWorkers < maxWorkers) {
                spawnWorker(job)
                runningWorkers++
            }
        })
    }, pollInterval)
}

// stop the queue
// clearInterval(intervalId)

startQueue()




