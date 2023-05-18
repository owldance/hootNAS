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
    let ret = ''
    try {
        ret = await shell('reboot')
    }
    catch (e) {
        if (e.exit === 255) {
            return Promise.resolve(e.message)
        }
        else return Promise.reject(e)
    }
    return Promise.resolve(ret)
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
