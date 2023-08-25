/**
 * @module utilities/getSettings
 */
'use strict'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
/**
 * Opens the webapi-settings.json file and returns the settings object
 * @function getSettings - Get the settings from the webapi-settings.json file
 * @async
 * @returns {Promise<object>} - A Promise that resolves with the settings object.
 * @throws {Promise<Error>} - A Promise that rejects with the error
 */
export async function getSettings() {
    try {
        // import.meta.url is a special meta property in ECMAScript modules 
        // (ESM) that returns the URL of the current module.
        const thisFileName = fileURLToPath(import.meta.url);
        const thisDirName = path.dirname(thisFileName);
        const filePath = path.join(thisDirName, '../webapi-settings.json');
        const settings = await fs.readFile(filePath, 'utf8')
        return JSON.parse(settings)
    } catch (e) {
        throw e
    }
}

