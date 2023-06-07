#!/usr/bin/nodejs/node-v18.12.0-linux-x64/bin/node

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const basePath = `${process.env.PWD}/Documents/github/express-server`
const dbPath = `${basePath}/db/hoot.db`

export async function selectUser(name) {
  let result = null
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.get(`SELECT * FROM users WHERE name = '${name}'`)
    await db.close()
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
  return Promise.resolve(result)
}

// selectUser('Monkey')
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
