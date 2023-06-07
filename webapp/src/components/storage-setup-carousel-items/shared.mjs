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
    if (!response.ok) 
      throw new Error(data.message)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve(data)
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
export async function oldpost(uri, payload) {
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
    console.log('error in post', e)
    return Promise.reject(e)
  }
  console.log('ok post')

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


