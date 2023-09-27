/**
 * This file contains all the api calls used in the app
 * @module api/calls
 * @typedef {import('../../../webapi/nfs/insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { post } from './post.mjs'


/**
 * Selects NFS exports by user ID.
 * @async
 * @function
 * @param {Object} appstate - The application state object.
 * @returns {Promise<Array<NfsExport>>} - The response object.
 * @throws {Error} - The error object.
 */
export async function selectNfsExportsByUserId(appstate) {
    try {
        return await post('api/selectNfsExportsByUserId', {
            accesstoken: appstate.user.accesstoken,
            userid: appstate.user.id
        })
    } catch (e) {
        throw e
    }
}


