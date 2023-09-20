/**
 * This is a module that is used to schedule jobs.
 * @module jobduler
 * @typedef {import('./queries/getJobs.mjs').Job} Job
 * @typedef {import('./queries/getJobs.mjs').Jobs} Jobs
 */
'use strict'
import { Worker } from 'worker_threads'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout, setInterval } from 'timers'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import { getIdleJobs } from './queries/getJobs.mjs'
import { updateJob } from './queries/updateJob.mjs'

const jobsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)), '/jobs')


/**
 * @todo restart all jobs on startup, setting status to idle, where status is running
 */

/**
 * Spawns a worker to run a job.
 * @function spawnWorker
 * @async
 * @param {Job} job - The job object containing information about the job to run.
 */
const spawnWorker = (job) => {
    const worker = new Worker(
        `${jobsPath}/${job.run_job}.mjs`, {
        name: `${job.run_job}`,
        workerData: JSON.parse(job.run_data)
    })
    worker.on('message', (message) => {
        updateJob(job.id, null, null, message, null)
    })
    worker.on('error', (e) => {
        updateJob(job.id, false, 'idle', e.message, null)
    })
    worker.on('online', () => {
        updateJob(job.id, null, 'running', null, null)
    })
    worker.on('exit', (exitCode) => {
        updateJob(job.id,
            (exitCode == 0 ? true : false), 'idle', null, exitCode)
    })
}
// query database for active jobs
const idleJobs = await getIdleJobs()

// spawn workers for each active job
idleJobs.forEach((job) => {
    spawnWorker(job)
})




