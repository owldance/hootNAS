#!/usr/bin/nodejs/node-v18.12.0-linux-x64/bin/node
/**
 * The main server module
 * 
 * if you are working in your local dev environment you must set the 
 * environment variable HOOT_REPO to point to the root of your local hootNAS 
 * git repository. if HOOT_REPO is not set, the server will assume that it is
 * running in a production environment and will use the default path 
 * /usr/local/hootnas
 *
 * remember to add "type": "module" in package.json
 * @module server
 */
'use strict'
import express from 'express'
import { apiRouter, pubRouter } from './routes/index.mjs'
export const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
export const serverPath = `${basePath}/webserver`
export const appPath = `${basePath}/webapp/dist`


const server = express()
let port = 80
if (process.env.HOOT_REPO) {
    console.log(`hootNAS server running in development mode`)
    // if you change this port number, remember also to change it in
    // webapp/src/components/storage-setup-carousel-items/shared.mjs
    port = 8000
}
// json parse post body
server.use(express.json())
// set CORS headers
server.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers',
        'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})
// serve static content 
server.use(express.static(appPath, { index: 'index.html' }))

// just a test 
async function requireToken(req, res, next) {
    const { accesstoken } = req.body
    if (accesstoken) {
        next()
    } else {
        res.status(403).send({ message: 'No token provided' })
    }
}
//server.use('/api', requireToken, apiRouter)
server.use('/api', apiRouter)
server.use('/pub', pubRouter)

server.listen(port, () => {
    console.log('hootNAS is listening')
})