/**
 * Remove a new Network File Share (NFS)
 * @module removeNetworkFileShare
 * @typedef {import('../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { deleteNfsExportById } from './deleteNfsExportById.mjs' 
import { insertJob } from '../schedule/insertJob.mjs'

/**
 * Remove a network file share.
 * @async
 * @param {number} id - The ID of the NFS export to remove.
 * @returns {Promise<QueryResult>}
 */
export async function removeNetworkFileShare(id) {
    try {
        /** @type {QueryResult} */
        const nfsQueryResult = await deleteNfsExportById(id)
        console.log(`nfsQueryResult.changes = ${nfsQueryResult.changes}`)
        // check for properties pertaining to the backing store
        // add job to the scheduler that removes the backing store
        // /** @type {QueryResult} */
        // const jobQueryResult = await insertJob(
        //     {
        //         user_id: nfsExport.user_id,
        //         name: 'removeNfsShare',
        //         desc: 'remove a NFS share',
        //         script: 'nfs/removeNfsBackingStore',
        //         script_data: `{ "nfsExportId": ${id} }`
        //     }
        // )
        // console.log(`jobQueryResult.lastID = ${jobQueryResult.lastID}`)
        return nfsQueryResult
    }
    catch (e) {
        throw e
    }
}
