/**
 * Reboots the system
 * @module rebootSystem
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * Reboots the system
 * @function rebootSystem
 * @async
 * @returns {Promise<String>} On resolve, command raw output
 * @returns {Promise<Error>} On reject, Error object with error message
 */
export async function rebootSystem() {
    try {
        const ret = await shell('reboot')
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

// rebootSystem()
//     .then((data) => {
//         console.log('then')
//         console.log(data)
//     })
//     .catch((e) => {
//         console.log('catch')
//         console.log(e)
//     })

