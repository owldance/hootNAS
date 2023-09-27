/**
 * Creates a new Network File Share (NFS)
 * @module createNetworkFileShare
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { insertNfsExport } from './insertNfsExport.mjs'
import { insertJob } from '../scheduler/insertJob.mjs'



/**
 * Creates a new network file share.
 * @async
 * @param {NfsExport} nfsExport - The NFS export to create.
 * @returns {Promise<void>}
 */
export async function createNetworkFileShare(nfsExport) {
    try {
        // remove the id property, so it gets a new id assigned by the database
        delete nfsExport.id
        /** @type {QueryResult} */
        const nfsQueryResult = await insertNfsExport(nfsExport)
        // set the id property to the id assigned by the database
        nfsExport.id = nfsQueryResult.lastID
        console.log(`nfsQueryResult.lastID = ${nfsQueryResult.lastID}`)
        // add job to the scheduler that creates the backing store
        /** @type {QueryResult} */
        const jobQueryResult = await insertJob(
            {
                user_id: nfsExport.user_id,
                name: 'createNfsShare',
                desc: 'Create a new NFS share',
                script: 'nfs/createNfsBackingStore',
                script_data: `{ "nfsExportId": ${nfsExport.id} }`
            }
        )
        console.log(`jobQueryResult.lastID = ${jobQueryResult.lastID}`)
    }
    catch (e) {
        throw e
    }
}
