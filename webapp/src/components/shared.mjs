/**
 * Contains shared methods for CarouselItem components in StorageSetupCarousel
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
 * Custom exception for api errors
 * @constructor
 * @param {String} message
 * @param {Integer} exit error code
 * @param {Integer} status http status code
 * @param {String} statusText http status text
 * @returns {ApiException}
 */
function ApiException(message, exit, status, statusText) {
  this.message = message
  this.exit = exit
  this.httpStatus = status
  this.httpStatusText = statusText
  this.name = "ApiException"
}
/**
 * Makes a POST request to the host serving the app. If the webapp is not being
 * served from port 80, then the request is made to localhost:8000.
 * @async 
 * @function
 * @param {String} uri the resource requested
 * @param {Object} payload the data to be sent
 * @param {Integer} timeout request timeout in milliseconds
 * @returns {Promise<Response>} The Response object
 * @returns {Promise<Error>} On reject 
 */
export async function post(uri, payload = {}, timeout = 40000) {
  const controller = new AbortController()
  const timeoutID = setTimeout(() => { controller.abort() }, timeout)
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
      signal: controller.signal,
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    // responses are sent as json
    const bodydata = await response.json()
    clearTimeout(timeoutID)
    if (!response.ok) {
      throw new ApiException(bodydata.message, bodydata.exit,
        response.status, response.statusText)
    }
    return bodydata
  }
  catch (e) {
    throw e
  }
}
/**
 * Pauses further execution for a given amount of time, if used with await
 * @async 
 * @function
 * @param {Integer} time time in milliseconds
 * @returns {Promise} On resolve
 */
export async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
