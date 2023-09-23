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
 * @property {number} id Unique identifier of the export.
 * @property {number} user_id ID of the user who created the export.
 * @property {number} status_id ID of the status of the export.
 * @property {string} modified date and time the export modified by user.
 * @property {string} created date and time the export was created by user.
 * @property {string} name name of the export.
 * @property {string} desc description of the export.
 * @property {string} clients clients that are allowed to access the export.
 * @property {number} quota limit on the amount of space used by the export.
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
    console.log(query)
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