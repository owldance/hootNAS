/**
 * Convert a nodejs error object into a regular js object
 * @module utilities/getErrorObject
 */
'use strict'
/**
 * convert nodejs error object into a regular js object. some properties of 
 * the nodejs error object are not enumerable, so we must use Object.getOwnPropertyNames() to
 * get all properties of the error object.
 * @function getErrorObject
 * @param {Error} error nodejs error object
 * @returns {Object} regular js object
 */
export function getErrorObject(error) {
    return Object.getOwnPropertyNames(error).reduce((acc, curr) => {
      acc[curr] = error[curr]
      return acc
    }, {})
  }
  