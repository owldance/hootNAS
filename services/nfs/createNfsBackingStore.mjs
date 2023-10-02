/**
 * Creates a ZFS dataset for the NFS export
 * @module nfs/createNfsBackingStore
 * @typedef {import('./insertNfsExport.mjs').NfsExport} NfsExport
 * @exports createNfsBackingStore
 */
'use strict'
import { parentPort, workerData, threadId } from 'node:worker_threads'
import { setTimeout } from 'timers/promises'
import { selectNfsExportById } from './selectNfsExportById.mjs'
import { updateNfsExport } from './updateNfsExport.mjs'

console.log('hello from createNfsBackingStore')
import main from 'module'
console.log(main.runMain)
export default async function createNfsBackingStore(id = null) {
    try {
        if (!id) id = workerData.data.id
        // get the NFS export from the database
        /** @type {NfsExport} */
        const nfsExport = await selectNfsExportById(id)
        // generate random number between 5000 and 10000
        const randomTime = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000)
        await setTimeout(randomTime)
        await updateNfsExport({
            id: nfsExport.id,
            status_id: 3,
            path: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`,
            mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
        })
    } catch (e) {
        throw e
    }
}

if (threadId) {
    // this module is being executed in a worker thread
    await createNfsBackingStore()
    process.exit(0)
}

// createZfs(`dpool/data/${nfsExport.user_name}`, 'X',
//     {
//         compression: 'lz4',
//         mountpoint: `dpool/data/${nfsExport.user_name}/${nfsExport.name}`
//     }
// )

// if (nfsExport.all_squash) {
//     // all uids/gids are mapped to the anonymous uid/gid
//     // files on server must be owned by "nobody"
//     // chown nobody:nogroup /bzpool/share/herman-share
// }

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
