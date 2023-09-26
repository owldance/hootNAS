/**
 * Inserts a nfsExport object in the nfs_exports table.
 * @module insertNfsExport
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'

/**
 * Represents the `nfs_exports` table.
 * @typedef {Object} NfsExport
 * @property {number} id - The ID of the NFS export.
 * @property {number} user_id - The ID of the user who owns the NFS export.
 * @property {number} status_id - The ID of the status of the NFS export. Default value: 1.
 * @property {string} modified - The date and time when the NFS export was last modified. Default value: CURRENT_TIMESTAMP.
 * @property {string} created - The date and time when the NFS export was created. Default value: CURRENT_TIMESTAMP.
 * @property {string|null} name - The name of the NFS export. Default value: NULL.
 * @property {string|null} desc - The description of the NFS export. Default value: NULL.
 * @property {string|null} clients - The clients that are allowed to access the NFS export. Default value: NULL.
 * @property {number} quota - The quota of the NFS export. Default value: 0.
 * @property {string|null} expert_config - The expert configuration of the NFS export. Default value: NULL.
 * @property {boolean} kerb_auth - Whether Kerberos authentication is enabled for the NFS export. Default value: FALSE.
 * @property {string} path - The path of the NFS export. Default value: NULL.
 * @property {string|null} sec - The security mode of the NFS export. Default value: NULL.
 * @property {boolean} ro - Whether the NFS export is read-only. Default value: TRUE.
 * @property {boolean} sync - Whether synchronous writes are enabled for the NFS export. Default value: TRUE.
 * @property {boolean} wdelay - Whether write delays are enabled for the NFS export. Default value: TRUE.
 * @property {boolean} hide - Whether the NFS export is hidden. Default value: TRUE.
 * @property {boolean|null} crossmnt - Whether the NFS export is a cross-mount point. Default value: NULL.
 * @property {boolean} subtree_check - Whether subtree checking is enabled for the NFS export. Default value: FALSE.
 * @property {boolean} secure_locks - Whether secure file locking is enabled for the NFS export. Default value: TRUE.
 * @property {string|null} mountpoint - The mount point of the NFS export. Default value: NULL.
 * @property {string|null} fsid - The file system ID of the NFS export. Default value: NULL.
 * @property {boolean} nordirplus - Whether the NFS export supports NFSv4.1. Default value: FALSE.
 * @property {string|null} refer - The reference of the NFS export. Default value: NULL.
 * @property {string|null} replicas - The replicas of the NFS export. Default value: NULL.
 * @property {boolean} pnfs - Whether the NFS export supports pNFS. Default value: FALSE.
 * @property {boolean} security_label - Whether security labels are enabled for the NFS export. Default value: FALSE.
 * @property {boolean} root_squash - Whether root squashing is enabled for the NFS export. Default value: TRUE.
 * @property {boolean} all_squash - Whether all squashing is enabled for the NFS export. Default value: FALSE.
 * @property {number|null} anonuid - The anonymous user ID of the NFS export. Default value: NULL.
 * @property {number|null} anongid - The anonymous group ID of the NFS export. Default value: NULL.
 */

/**
 * Inserts a new NFS export into the database.
 * @param {NfsExport} nfsExport - The NFS export object to be inserted.
 * @returns {Promise<QueryResult>} - A Promise that resolves with the result of the insert query.
 * @throws {Error} - If there is an error executing the insert query.
 */
export async function insertNfsExport(nfsExport) {
  try {
    // for each property of the nfsExport object, that is not undefined, 
    // add it to the fields and values arrays
    const fields = []
    const values = []
    for (const [key, value] of Object.entries(nfsExport)) {
      if (value !== undefined) {
        fields.push(key)
        values.push(value)
      }
    }
    // create query string
    const query = `
    INSERT INTO nfs_exports (${fields.join(', ')}) 
    VALUES (${values.map((value) => '?').join(', ')})`
    const result = await executeQueryRun(query, values)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  insertNfsExport({
    user_id: 1,
    status_id: 1,
    name: 'test',
    desc: 'test',
    clients: '*',
    quota: 0,
    kerb_auth: true,
    sec: 'sys',
    ro: false,
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}








/*


# create a nfs share
mkdir -p /bzpool/share/herman-share
# all users on any client can read/write, files on server owned by "nobody"
chown nobody:nogroup /bzpool/share/herman-share
# in /etc/exports add
#/bzpool/share/herman-share      *(rw,all_squash,no_subtree_check)
exportfs -ra

# alternative to above
mkdir -p /bzpool/share/herman-share
# only root on client can write, all other users on client can only
# read. Files on server are owned by user "root"
# NOTE privilege escalation is possible on the NFS server, use only if 
# the client is trusted.
# in /etc/exports add
#/bzpool/share/herman-share      *(rw,sync,no_subtree_check,no_root_squash)
exportfs -ra


# remove nfs share

# nfs client connect
sudo apt install nfs-common
sudo mkdir /home/administrator/nfs
sudo mount 192.168.139.139:/bzpool/share/herman-share /home/administrator/nfs
# disconnect nfs
sudo umount /home/administrator/nfs

*/