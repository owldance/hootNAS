/**
 * Selects NFS shares
 * @module selectNfs
 */
'use strict'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const basePath = process.env.HOOT_REPO || '/usr/local/hootnas'
const dbPath = `${basePath}/db/hoot.db`
/**
 * @typedef {Object} Share
 * @property {Number} id
 * @property {Number} user_id
 * @property {String} name a user assigned identifier, default null
 * @property {String} desc description, default null
 * @property {String} path default null
 * @property {String} sec default null
 * @property {Boolean} ro default true
 * @property {Boolean} sync default true
 * @property {Boolean} wdelay default true
 * @property {Boolean} hide default true
 * @property {Boolean} crossmnt default null
 * @property {Boolean} subtree_check default false
 * @property {Boolean} secure_locks default true
 * @property {String} mountpoint default null
 * @property {String} fsid default null
 * @property {Boolean} nordirplus default false
 * @property {String} refer default null
 * @property {String} replicas default null
 * @property {Boolean} pnfs default false
 * @property {Boolean} security_label default false
 * @property {Boolean} root_squash default true
 * @property {Boolean} all_squash default false
 * @property {Number} anonuid default null
 * @property {Number} anongid default null
 */

/**
 * @typedef {Object} Shares
 * @property {Array<Share>} share a NFS share
 */

/**
https://dev.to/mliakos/how-to-handle-boolean-values-in-sqlite-using-javascript-proxies-1mg1
SELECT name, type FROM pragma_table_info('nfs_exports');
id|INTEGER
user_id|INTEGER
name|TEXT
desc|TEXT
path|TEXT
sec|TEXT
ro|BOOLEAN
sync|BOOLEAN
wdelay|BOOLEAN
hide|BOOLEAN
crossmnt|BOOLEAN
subtree_check|BOOLEAN
secure_locks|BOOLEAN
mountpoint|TEXT
fsid|TEXT
nordirplus|BOOLEAN
refer|TEXT
replicas|TEXT
pnfs|BOOLEAN
security_label|BOOLEAN
root_squash|BOOLEAN
all_squash|BOOLEAN
anonuid|INTEGER
anongid|INTEGER
 */

/**
 * Selects NFS shares by id
 * @function selectNfsByUserId
 * @async
 * @param {Number} userId user id
 * @returns {Shares} on resolve
 * @throws {Error} on reject
 */
export async function selectNfsByUserId(userId) {
  try {
    let result = null
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    result = await db.all(
      `SELECT nfs_exports.*
      FROM nfs_exports
      WHERE user_id = ${userId}`
    )
    await db.close()
    return result
  } catch (e) {
    throw e
  }
}

// selectNfsByUser(1)
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
