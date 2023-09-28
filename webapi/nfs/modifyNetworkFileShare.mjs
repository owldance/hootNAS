/**
 * Modify a new Network File Share (NFS)
 * @module modifyNetworkFileShare
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { updateNfsExport } from './updateNfsExport.mjs' 
import { insertJob } from '../schedule/insertJob.mjs'

/**
 * Modify a network file share.
 * @async
 * @param {NfsExport} nfsExport - A NfsExport subset containing only the properties to be modified.
 * @returns {Promise<QueryResult>}
 */
export async function modifyNetworkFileShare(nfsExport) {
    try {
        /** @type {QueryResult} */
        const nfsQueryResult = await updateNfsExport(nfsExport)
        console.log(`nfsQueryResult.changes = ${nfsQueryResult.changes}`)
        // check for properties pertaining to the backing store
        // add job to the scheduler that modifies the backing store
        // /** @type {QueryResult} */
        // const jobQueryResult = await insertJob(
        //     {
        //         user_id: nfsExport.user_id,
        //         name: 'modifyNfsShare',
        //         desc: 'Modifies a exisiting NFS share',
        //         script: 'nfs/ModifyNfsBackingStore',
        //         script_data: `{ "nfsExportId": ${nfsExport.id} }`
        //     }
        // )
        // console.log(`jobQueryResult.lastID = ${jobQueryResult.lastID}`)
        return nfsQueryResult
    }
    catch (e) {
        throw e
    }
}
