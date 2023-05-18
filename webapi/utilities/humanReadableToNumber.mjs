/**
 * Execute a shell command locally or remote
 * @module humanReadableToNumber
 */
'use strict'

/**
 * Converts a human readable <String> number to <Number> 
 * e.g. 0.1M to 100000, or 20.4G to 20400000000
 * @function
 * @param {String} humanReadable human readable number
 * @returns {Number} decimal number representation
 */
export function humanReadableToNumber(humanReadable) {
    let ret = humanReadable
    try {
        if (typeof humanReadable === 'string') {
            const regex = /(?<size>\d+\.?\d*)(?<unit>[KMGTP]?)/gm
            const match = regex.exec(humanReadable)
            if (match) {
            const { size, unit } = match.groups
            const unitMap = { 
                K: 1e3, 
                M: 1e6, 
                G: 1e9, 
                T: 1e12, 
                P: 1e15,
                E: 1e18,
                Z: 1e21,
                Y: 1e24}
            ret = size * unitMap[unit]
            }
        }
    } catch (e) {  
        return e
    }
    return ret
    }



 