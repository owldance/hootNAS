/**
 * Checks if persistence is active
 * @module isPersistenceActive
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Checks if persistence is active
 * @function isPersistenceActive
 * @async
 * @returns {Promise<Object>} A object with a message property
 * @throws {Error} if shell command fails
 */
export async function isPersistenceActive() {
    try {
        await shell('ls /run/live/persistence')
        return { message: 'Persistence is active'}
    }
    catch (e) { 
        throw e
    }
}


