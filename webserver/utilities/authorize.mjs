
import jwt from 'jsonwebtoken'
import { getErrorObject } from '../../webapi/utilities/getErrorObject.mjs'
const accessTokenSecret = 'youraccesstokensecret'

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
 * @typedef {Object} User
 * @property {String} name
 * .... etc 
 * @property {Array<String>} groups group names
 */

export async function checkAuthorization(req, res, next) {
    const { accesstoken } = req.body
    try {
        if (!accesstoken)
            throw new Error('No token provided')
        const user = await verifyJwt(accesstoken)
        // check if user is member of admin group
        if (!user.groups.includes('admins'))
            throw new Error('User is not authorized')
        console.log({ message: `${user.name} is authorized` })
        next()
    } catch (e) {
        console.log(e)
        res.status(403).send(getErrorObject(e)) //&& next(error)
    }
}
