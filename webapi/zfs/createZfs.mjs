/**
 * Creates a new ZFS dataset
 * @module createZfs
 */

'use strict'
import { shell } from "../utilities/shell.mjs"

/**
 * @function createZfs Creates a new ZFS filesystem.
 * parameters 'options' and 'properties' are optional from right
 * to left. i.e. if you only want to specify 'properties', you must assign the 
 * primitive JavaScript value undefined to 'options' and 'properties'.
 * @async
 * @param {string} filesystem - The name of the filesystem to create.
 * @param {string} options - One or more options [Pnpuv], or value undefined
 * @param {Object} properties - Object with one or more properties
 * { property : value }, or value undefined
 * @returns {string} - The result of the shell command.
 * @throws {Error} - Error from the shell command.
 */
export async function createZfs(filesystem, options='P', properties={}) {
    try {
        // create string of all properties
        let propertiesString = ''
        for (const [key, value] of Object.entries(properties)) {
            propertiesString += `-o ${key}=${value} `
        }
        // if options is not empty and does not start with a dash, add a dash
        if (options && !options.startsWith('-'))
            options = '-' + options
        let command = `zfs create ${options} ${propertiesString} ${filesystem}`
        // strip extra spaces
        command = command.replace(/\s+/g, ' ').trim()
        const result = await shell(command)
        return result
        } catch (e) {
            throw e
        }
}

// createZfs('dpool/data', 'X', { compression: 'lz4', mountpoint: '/data' } )
//     .then(result => {
//         console.log(result)
//     })
//     .catch(error => {
//         console.error(error)
//     })

// createZfs('dpool/data')
//     .then(result => {
//         console.log(result)
//     })
//     .catch(error => {
//         console.error(error)
//     })
