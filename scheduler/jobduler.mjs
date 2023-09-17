/**
 * This is a module that is used to schedule jobs.
 * Just testing out the bree package.
 * @module jobduler
 */
import Bree from 'bree'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'timers/promises'

const soptions = {
    foo: 'bar',
    beep: 'boop'
}
const jobsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)), '/jobs')

const bree = new Bree(
    {
        jobs: [
            { name: 'job-1', worker: { workerData: soptions } },
        ],
        root: jobsPath,
        defaultExtension: 'mjs'
    }
)

await bree.start()

await setTimeout(2000)
const jobName = 'job-2'
await bree.add(jobName)
await bree.start(jobName)




