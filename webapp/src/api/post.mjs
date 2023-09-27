/**
 * Post method for api calls
 * @module api/post
 */
'use strict'
/**
 * Represents an exception that occurred during an API call.
 * @class
 */
class ApiException {
    /**
     * Creates an instance of ApiException.
     * @param {string} message - The error message.
     * @param {number} exit - The exit code.
     * @param {number} status - The HTTP status code.
     * @param {string} statusText - The HTTP status text.
     */
    constructor(message, exit, status, statusText) {
        this.message = message
        this.exit = exit
        this.httpStatus = status
        this.httpStatusText = statusText
        this.name = "ApiException"
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
  let bodydata
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
    // responses are in json format
    bodydata = await response.json()
    if (!response.ok) {
      throw new ApiException(bodydata.message, bodydata.exit, 
        response.status, response.statusText)
    }
  }
  catch (e) {
    throw e
  }
  return bodydata
}
