/**
 * Creates a zvol
 * @module createZvol
 */

'use strict'
import { shell } from "../utilities/shell.mjs"

/**
 * @function createZvol Creates a new ZFS zvol with the specified size and name.
 * parameters 'options', 'properties', and 'blocksize' are optional from right
 * to left. i.e. if you only want to specify 'blocksize', you must assign the 
 * primitive JavaScript value undefined to 'options' and 'properties'.
 * @async
 * @param {string} size - The size of the zvol to create.
 * @param {string} name - The name of the zvol to create.
 * @param {string} options - One or more options [Pnpuv], or value undefined
 * @param {Object} properties - Object with one or more properties
 * { property : value }, or value undefined
 * @param {blocksize} blocksize - The blocksize of the zvol to create. can be 
 * specified using human-readable suffixes (for example, k, KB, M, Gb, etc.)
 * @returns {string} - The result of the shell command.
 * @throws {Error} - Error from the shell command.
 */
export async function createZvol(size, name, options='P', 
    properties={}, blocksize) {
    try {
        // if options is not empty and does not start with a dash, add a dash
        if (options && !options.startsWith('-'))
        options = '-' + options
        // create string of all properties
        let propertiesString = ''
        for (const [key, value] of Object.entries(properties)) {
            propertiesString += `-o ${key}=${value} `
        }
        // if blocksize is not empty create string -b blocksize
        let blocksizeString = ''
        if (blocksize) 
            blocksizeString = `-b ${blocksize}`
        // create zvol
        let command = `zfs create ${options} ${blocksizeString} \
            ${propertiesString} -V ${size} ${name}`
        // strip extra spaces
        command = command.replace(/\s+/g, ' ').trim()
        const result = await shell(command)
        return result
    } catch (e) {
        throw e
    }
}

// createZvol('1G', 'blubla', undefined, { compression: 'lz4', mountpoint: '/data' }, '1M')
//      .then(result => {
//          console.log(result)
//      })
//      .catch(error => {
//          console.error(error)
//      })

// createZvol('1G', 'blubla', undefined, undefined, '1M')
//      .then(result => {
//          console.log(result)
//      })
//      .catch(error => {
//          console.error(error)
//      })

// createZvol('1G', 'blablu')
//      .then(result => {
//          console.log(result)
//      })
//      .catch(error => {
//          console.error(error)
//      })