/**
 * Authorization middleware
 * @module webserver/utilities/authorize
 */
import jwt from 'jsonwebtoken'
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'
import { accessTokenSecret } from '../../webserver/webserver.mjs'

/**
 * Verifies a jwt token and returns the payload
 * @function verifyJwt
 * @param {String} accessToken 
 * @returns {User} on resolve
 * @returns {Error} on reject
 */
async function verifyJwt(accessToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, accessTokenSecret, (err, payload) => {
            if (err) {
                err.exit = 1
                reject(err)
            }
            else
                resolve(payload)
        })
    })
}
/**
 * Object containing the groups required to access a route
 * @constant {Object} authRequired
 * @property {Array<String>} route the route path
 * ...etc
*/
const authRequired = {
    initialSetup: ['admins'],
    rebootSystem: ['admins'],
    getBlockDevices: ['admins', 'users'],
    selectNfsByUserId: ['users']
}
/**
 * @typedef {Object} User
 * @property {String} name
 * .... etc 
 * @property {Array<String>} groups group names
 */
/**
 * Checks if a user is authorized to access a route
 * @function checkAuthorization
 * @async
 * @param {Request} req 
 * @param {Response} res on Error, 403 Forbidden
 * @param {Function} next
 */
export async function checkAuthorization(req, res, next) {
    const { accesstoken } = req.body
    try {
        // if route is not authRequired, skip authorization
        if (!authRequired.hasOwnProperty(req.route.path.slice(1))) {
            next()
            return
        }
        // if route is authRequired, check if token is valid        
        if (!accesstoken)
            throw new Error('No token provided')
        const user = await verifyJwt(accesstoken)
        // check if user is active
        if (user.status !== 'active')
            throw new Error('User is not active')
        // check if user is member of group required for this route
        if (!user.groups.some(
            group => authRequired[req.route.path.slice(1)].includes(group))
        )
            throw new Error('User is not authorized')
        next()
    } catch (e) {
        res.status(403).send(getErrorObject(e)) //&& next(error)
    }
}
