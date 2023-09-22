/**
 * Queries for the nfs_exports table
 * @module nfs_exports
 */
'use strict'
import { executeQueryRun, executeQueryAll, executeQueryGet } from './sqlite3-api-calls.mjs'

/**
 * Represents the `nfs_exports` table.
 * @typedef {Object} NfsExport
 * @property {number} id Unique identifier of the export.
 * @property {number} user_id ID of the user who created the export.
 * @property {number} status_id ID of the status of the export.
 * @property {string} modified date and time the export modified by user.
 * @property {string} created date and time the export was created by user.
 * @property {string} name name of the export.
 * @property {string} desc description of the export.
 * @property {string} clients clients that are allowed to access the export.
 * @property {number} vol_size size of the export.
 * @property {string} expert_config expert configuration of the export.
 * @property {boolean} kerb_auth Whether Kerberos authentication is enabled.
 * @property {string} path path of the export.
 * @property {string} sec security mode of the export.
 * @property {boolean} ro Whether the export is read-only.
 * @property {boolean} sync Whether the export is synchronous.
 * @property {boolean} wdelay Whether write delays are enabled.
 * @property {boolean} hide Whether the export is hidden.
 * @property {boolean} crossmnt Whether the export is a cross-mount.
 * @property {boolean} subtree_check Whether subtree checking is enabled.
 * @property {boolean} secure_locks Whether secure locks are enabled.
 * @property {string} mountpoint mount point of the export.
 * @property {string} fsid file system ID of the export.
 * @property {boolean} nordirplus Whether the export is using NFSv4.1 without the `DIRPLUS` feature.
 * @property {string} refer reference of the export.
 * @property {string} replicas replicas of the export.
 * @property {boolean} pnfs Whether the export is using pNFS.
 * @property {boolean} security_label Whether security labels are enabled.
 * @property {boolean} root_squash Whether root squashing is enabled.
 * @property {boolean} all_squash Whether all squashing is enabled.
 * @property {number} anonuid anonymous user ID of the export.
 * @property {number} anongid anonymous group ID of the export.
 * @property {string} user_name Name of the owner.
 */

/**
 * Retrieves an NFS export by ID from the database.
 * @async
 * @param {number} [id=0] ID of the NFS export to retrieve.
 * @returns {Promise<NfsExport>} The NFS export object.
 * @throws {Error} If there was an error executing the query.
 */
export async function getNfsExport(id = 0) {
  try {
    const query = `SELECT nfs_exports.*, users.name AS user_name 
    FROM nfs_exports JOIN users ON nfs_exports.user_id = users.id 
    WHERE nfs_exports.id = ${id}`
    const result = await executeQueryGet(query)
    return result
  } catch (e) {
    throw e
  }
}

export async function updateNfsExportStatus(id, status) {
  try {
    const query = `UPDATE nfs_exports
      SET status_id = (SELECT id FROM export_status WHERE status = '${status}') 
      WHERE id = ${id}`
    const result = await executeQueryRun(query)
    return result
  } catch (e) {
    throw e
  }
}

// getNfsExport(1)
//   .then((result) => {
//     console.log(result)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
