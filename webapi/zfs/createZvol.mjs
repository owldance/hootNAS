/**
 * Creates a zvol
 * @module createZvol
 */

'use strict'
import { shell } from "../utilities/shell.mjs"

/**
 * @function createZvol Creates a new ZFS zvol with the specified size and name.
 * @async
 * @param {string} size - The size of the zvol to create.
 * @param {string} name - The name of the zvol to create.
 * @returns {Promise<string>} - A Promise that resolves with the result of the shell command.
 * @throws {Promise<Error>} - A Promise that rejects with the error from the shell command.
 */
export async function createZvol(size, name) {
    try {
    // create zvol
    const cmd = `zfs create -P -V ${size} ${name}`
    const result = await shell(cmd)
    return result
    } catch (e) {
        throw e
    }
}

