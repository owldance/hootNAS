/**
 * Updates a nfsExport object in the nfs_exports table.
 * @module updateNfsExport
 * @typedef {import('../../db/executeQueryRun.mjs').QueryResult} QueryResult
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 */
'use strict'
import { executeQueryRun } from '../../db/executeQueryRun.mjs'

/**
 * Updates a NFS export in the database.
 * @param {NfsExport} nfsExport - The updated NFS export object.
 * @returns {Promise<QueryResult>} - A Promise that resolves with the result of the insert query.
 * @throws {Error} - If there is an error executing the insert query.
 */
export async function updateNfsExport(nfsExport) {
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
    UPDATE nfs_exports
    SET ${fields.map((field) => `${field} = ?`).join(', ')}
    WHERE id = ${nfsExport.id}`
    const result = await executeQueryRun(query, values)
    return result
  } catch (e) {
    throw e
  }
}

// run test if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateNfsExport({
    id: 1,
    user_id: 1,
    status_id: 1,
    name: 'Very Important Share',
    quota: 1000,
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