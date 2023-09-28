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
 * @typedef {import('../webapi/schedule/insertJob.mjs').Job} Job
 */
'use strict'
import { Worker } from 'worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout, setInterval } from 'timers'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import { updateJob } from '../webapi/schedule/updateJob.mjs'
import { selectIdleJobs } from '../webapi/schedule/selectIdleJobs.mjs'

/** @const {Number} maxWorkers max number of simultaneous workers */
const maxWorkers = 2 
/** @const {Number} pollInterval interval to poll for idle jobs */
const pollInterval = 20000 
/** @var {Number} intervalId id of the polling timer */
let intervalId // id of the polling timer
/** @const {Number} runningWorkers number of workers running */
let runningWorkers = 0 

// reset all jobs to idle on startup
// this is to ensure a known state on startup, in case of abnormal shutdown
await updateJob( { id: 0, idle: true } )


/**
 * Spawns a worker to run a job.
 * @function spawnWorker
 * @async
 * @param {Job} job - The job object to run.
 */
const spawnWorker = async (job) => {
        job.script = `./webapi/${job.script}.mjs`
        console.log(`spawning worker for job id:${job.id} script:${job.script}`)    
        const worker = new Worker( 
            job.script, {
            name: job.script,
            workerData: {
                data: JSON.parse(job.script_data), 
                id: job.id
            }
        })
        // configure worker event handlers
        worker.on('online', () => {
            updateJob({
                id: job.id, run_started: new Date().toISOString(), idle: false})
        })
        worker.on('message', (message) => {
            message = message.replace(/'/g, "''").replace(/"/g, '""')
            updateJob({ id: job.id, run_message: message })
        })
        worker.on('error', (e) => {
            // uncaught exception, worker is terminated
            // log the error message
            const message = e.message.replace(/'/g, "''").replace(/"/g, '""')
            updateJob({ id: job.id, run_message: message })
        })
        worker.on('exit', (exitCode) => {
            // if process.exit(exitCode) was called, the exitCode is passed
            // if the worker was terminated, then exitCode=1
            runningWorkers--
            updateJob({ id: job.id, run_ended: new Date().toISOString(),
                run_exit_code: exitCode, idle: true })
        })
}


function startQueue() {
    intervalId = setInterval(async () => {
        const idleJobs = await selectIdleJobs()
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




