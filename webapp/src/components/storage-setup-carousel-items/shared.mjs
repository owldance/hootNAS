/**
 * Contains all other methods for this app.
 * @module shared
 */
'use strict'
/**
* Makes a GET request to the host serving the app. If the webapp is not being
* served from port 80, then the request is made to localhost:8000.
* @async 
* @function
* @param {String} uri the resource requested
* @returns {Promise<Object>} On resolve
* @returns {Promise<Error>} On reject 
*/
export async function get(uri) {
  let endpoint
  if (location.port === '80' || location.port === '') {
    // we are in production
    endpoint = `http://${location.host}/${uri}`
  }
  else {
    // we are in development
    endpoint = `http://localhost:8000/${uri}`
  }
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    const data = await response.json()
    if (data.hasOwnProperty('exit')) {
      throw new Error(data.message)
    }
    return Promise.resolve(data)
  }
  catch (e) {
    return Promise.reject(e)
  }
}
/**
 * Makes a POST request to the host serving the app. If the webapp is not being
 * served from port 80, then the request is made to localhost:8000.
 * @async 
 * @function
 * @param {Object} payload Must at least contain the property 'name'
 * @returns {Promise<Object>} On resolve
 * @returns {Promise<Error>} On reject 
 */
export async function post(uri, payload) {
  let endpoint
  if (location.port === '80' || location.port === '') {
    // we are in production
    endpoint = `http://${location.host}/${uri}`
  }
  else {
    // we are in development
    endpoint = `http://localhost:8000/${uri}`
  }
  let data
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    data = await response.json()
    if (data.hasOwnProperty('error')) {
      throw new Error(data.error)
    }
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve(data)
}
/**
 * Pauses further execution for a given amount of time, if used with await
 * @async 
 * @function
 * @param {Integer} time time in milliseconds
 * @returns {Promise} On resolve
 */
export const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
/**
 * Converts a number into a human readable string.
 * @function
 * @param {Number} bytes 
 * @returns {String} On resolve
 */
export function toHumanReadable(bytes) {
  var s = ['bytes', 'k', 'M', 'G', 'T', 'P']
  var e = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, e)).toFixed(2) + s[e]
}
/**
 * Get the index of a vdev by name
 * @function
 * @param {String} vdevName The name of the vdev
 * @returns {Number} An index in the storagepool.vdevs array if vdevName exists; 
 * otherwise, -1
 */
export function createNewDefaultVdev(storagepool) {
  storagepool.vdevs.push({
    blockdevices: [],
    topology: null,
    name: 'default',
    compress: null,
    encrypt: null,
    password: 'password',
    capacity: 0
  })
}
/**
 * Checks if all disks are allocated i.e. the vdev 'devicepool' is empty
 * @function
 * @returns {Boolean} true if all disks are allocated; otherwise false
 */
export function allDisksAllocated(storagepool) {
  if (storagepool.vdevs[
    storagepool.vdevs.findIndex(({ name }) =>
      name === 'devicepool')
  ].blockdevices.length === 0)
    return true
  else return false
}
/**
 * Returns a sorted array of all disks
 * @function
 * @returns {Array<blockDevice>} Sorted alphabetically ascending 
 */
export function sortedDisks(storagepool) {
  // get all blockdevices
  const disks = []
  storagepool.vdevs.forEach(vdev => {
    vdev.blockdevices.forEach(disk => {
      disks.push(disk)
    })
  })
  // sort by kname ascending
  const orderedList = disks.sort((a, b) => {
    const nameA = a.kname.toLowerCase() // ignore upper and lowercase
    const nameB = b.kname.toLowerCase() // ignore upper and lowercase
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0 // when equal
  })
  return orderedList
}
/**
 * @typedef diskInfo
 * @type {Object}
 * @property {String} vdevName the name of the vdev it belongs to
 * @property {Number} vdevIndex the index of the vdev it belongs to
 * @property {Number} index the index of disk in the vdev it belongs to
 * @property {Boolean} selectedHere true if the disk belongs to this vdev; 
 * otherwise false
 */
/**
 * Gets information about a disk in relation to storagepool
 * @function
 * @param {String} findKname the kname to get info for
 * @returns {diskInfo} 
 */
export function diskInfo(findKname, storagepool, thisVdevIndex) {
  const result = {}
  result.index = -1
  result.selectedHere = false
  // search in all vdevs
  storagepool.vdevs.forEach(vdev => {
    const index = vdev.blockdevices.findIndex(({ kname }) =>
      kname === findKname)
    // if found 
    if (index != -1) {
      result.index = index
      result.vdevName = vdev.name
      result.vdevIndex = storagepool.vdevs.findIndex(({ name }) =>
        name === vdev.name)
      if (storagepool.vdevs[thisVdevIndex].name.match(vdev.name)) {
        result.selectedHere = true
      }
    }
  })
  return result
}
/**
 * Gets vdev index by name
 * @function
 * @param {String} vdevName The name of the vdev
 * @returns {Number} An index in the storagepool.vdevs array if vdevName exists; 
 * otherwise, -1
 */
export function vdevIndexOf(vdevName, storagepool) {
  return storagepool.vdevs.findIndex(({ name }) =>
    name === vdevName)
} 
