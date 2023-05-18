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
import { getBlockDevices } from '../webapi/blockdevices/getBlockDevices.mjs'
import { initialSetup } from '../webapi/blockdevices/initialSetup.mjs'
import { rebootSystem } from '../webapi/utilities/rebootSystem.mjs'
import { getSetupId } from '../webapi/utilities/getSetupId.mjs'

export const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
export const serverPath = `${basePath}/webserver`
export const appPath = `${basePath}/webapp/dist`

const server = express()
let port = 80
if (process.env.HOOT_REPO) {
    console.log(`hootNAS server running in development mode`)
    // if you change the port number, remember also to change it in
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

// routes
server.get('/getBlockDevices', async (req, res) => {
    try {
        const data = await getBlockDevices()
        res.status(200).send(data)
    }
    catch (e) {
        res.status(200).send(e)
    }
    return Promise.resolve()
})
server.get('/rebootSystem', (req, res) => {
    const data = rebootSystem()
    res.status(200).send(data)
})
server.get('/getSetupId', async (req, res) => {
    try {
        let data = await getSetupId()
        res.status(200).send({ message: data })
    }
    catch (e) {
        res.status(200).send(e)
    }
    return Promise.resolve()
})
server.post('/initialSetup', async (req, res) => {
    const storagepool = req.body
    try {
        if (!storagepool) {
            res.status(200).send({ message: 'storagepool object required' })
        } else {
            const data = await initialSetup(storagepool)
            res.status(200).send(data)
        }
    }
    catch (e) {
        res.status(200).send(e)
    }
    return Promise.resolve()
})

server.listen(port, () => {
    console.log('hootNAS is listening')
})