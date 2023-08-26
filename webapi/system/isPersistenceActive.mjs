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
 * @returns {Number} zero on active persistence
 * @throws {Error} if shell command fails
 */
export async function isPersistenceActive() {
    try {
        await shell('ls /run/live/persistence')
        return { message: 'Persistence is active' }
    }
    catch (e) { 
        throw e
    }
}

// isPersistenceActive()
// .then((data) => {
//     console.log('then')
//     console.log(data)
// })
// .catch((e) => {
//     console.log('catch')
//     console.log(e.exit)
//     console.log(e.message)
// })



