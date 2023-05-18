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
 * @returns {Promise<Message>} On resolve, message object with setup.id contents
 * @returns {Promise<Error>} On reject, Error object with error message
 */
export async function getSetupId() {
    let ret = ''
    try {
        ret = await shell('cat /root/setup.id')
        // remove the trailing newline
        ret = ret.replace(/\n$/, '')
    }
    catch (e) {
        return Promise.reject(e)
    }
    return Promise.resolve(ret)
}

// getSetupId()
// .then((data) => {
//     console.log('then')
//     console.log(data)
// })
// .catch((e) => {
//     console.log('catch')
//     console.log(e)
// })
// .finally(() => {



