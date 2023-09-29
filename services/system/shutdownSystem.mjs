/**
 * Reboots the system
 * @module shutdownSystem
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Shuts down the system
 * @function shutdownSystem
 * @async
 * @returns {String} Command raw output
 * @throws {Error} Error object with error message
 */
export async function shutdownSystem() {
    try {
        const ret = await shell('shutdown now')
        return { message: ret }
    }
    catch (e) {
        // when server is in dev mode, exit code 255 is due to ssh 
        // 'connection closed by remote', which 
        // indicates the command was successful
        if (e.exit === 255) {
            return { message: e.message }
        }
        throw e
    }
}