/**
 * Get the contents of the /root/setup.id file
 * @module getSetupId
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Get the contents of the /root/setup.id file, which is created by the 
 * initialSetup.mjs script
 * @function getSetupId
 * @async
 * @returns {Message} Message object with setup.id contents
 * @throws {Error} Error object
 */
export async function getSetupId() {
    let ret = ''
    try {
        ret = await shell('cat /root/setup.id')
        // remove the trailing newline
        ret = ret.replace(/\n$/, '')
        return { message: ret }
    }
    catch (e) { 
        throw e
    }
}



