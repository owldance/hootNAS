/**
 * Setup all initial storage and live-boot persistance
 * @module initialSetup
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
import { zwipeBlockDevice } from "./zwipeBlockDevice.mjs"
import { createPartitions } from "./createPartitions.mjs"
import { createZpool } from "../zfs/createZpool.mjs"
/**
 * A blockdevice is a physical disk/partition on the machine
 * @typedef blockDevice
 * @type {Object}
 * @property {String} kname internal kernel device name
 * @property {String} type device type
 * @property {String} path path to the device node
 * @property {Number} fstype filesystem type
 * @property {Number} fssize  filesystem size
 * @property {String} size  size of the device
 * @property {String} mountpoint  where the device is mounted
 * @property {String} parttype  partition type uuid
 * @property {String} partuuid  partition uuid
 * @property {String} partlabel  partition label
 * @property {String} wwn  unique storage identifier
 * @property {String} vendor  device vendor
 * @property {String} rev  device revision
 * @property {String} wwid device wwid
 * @property {String} vdev vdev name
 */
/** 
 * vdev is a ZFS virtual device i.e. a group of blockdevices or vdevs
 * @typedef vdev
 * @type {Object}
 * @property {Array<blockDevice>} blockdevices
 * @property {String} topology
 * @property {String} name
 * @property {String} compress
 * @property {String} encrypt
 * @property {String} password
 * @property {Number} capacity
 */
/**
 * A storagepool is a ZFS pool i.e. a group of vdevs
 * @typedef storagepool
 * @type {Object}
 * @property {Array<vdev>} vdevs
 * @property {String} topology
 * @property {String} name
 * @property {Boolean} compress
 * @property {Boolean} encrypt
 * @property {String} password
 * @property {Number} capacity
 */
/**
 * Sorts storagepool.vdevs by type and redundancy, and so that the order is:
 * 1. vdevs of type 'data' with redundancy 'stripe'
 * 2. vdevs of type 'data' with any other redundancy
 * 3. vdevs of any type with any redundancy 
 * @function XsortVdevs
 * @param {storagepool} storagepool
 * @returns {storagepool}
 */
function sortVdevs(storagepool) {
  let sortedVdevs = []
  for (const vdev of storagepool.vdevs) {
    if (vdev.type.startsWith('data')) {
      sortedVdevs.unshift(vdev)
    } else {
      sortedVdevs.push(vdev)
    }
  }
  storagepool.vdevs = sortedVdevs
  sortedVdevs = []
  for (const vdev of storagepool.vdevs) {
    if (vdev.type.startsWith('data')) {
      if (vdev.redundancy === 'stripe') {
        sortedVdevs.unshift(vdev)
      } else {
        sortedVdevs.push(vdev)
      }
    } else {
      sortedVdevs.push(vdev)
    }
  }
  storagepool.vdevs = sortedVdevs
  return storagepool
}
/**
 * Formats all blockdevices in storagepool.vdevs, labels all the first 
 * partition on all blockdevice 'persistence'. then creates a btrfs raid1 
 * filesystem with all partitions labeled 'persistence'.
 * @function createBtrfsPersistance
 * @param {storagepool} storagepool
 * @returns {Promise<Error>} On reject
 * @returns {Promise<Message>} On resolve
 */
async function createBtrfsPersistance(storagepool) {
  // create partitions for btrfs persistance. All partitions must be created 
  // before the persistance btrfs raid is created, otherwise, for any 
  // subsequent created partitions on the same blockdevice, the partition 
  // table on the device will be written, but the udev device manager will 
  // not update /dev directory even after a reboot.
  for (const vdev of storagepool.vdevs) {
    for (const blockdevice of vdev.blockdevices) {
      await createPartitions(`/dev/disk/by-id/${blockdevice.wwid}`,
        'persistence', 'dpool')
    }
  }
  // // create btrfs raid
  // // get all blockdevices in vdevs as one string 
  let persistancePartitions = ''
  for (const vdev of storagepool.vdevs) {
    for (const blockdevice of vdev.blockdevices) {
      persistancePartitions += `/dev/disk/by-id/${blockdevice.wwid}-part1 `
    }
  }
  // this also works 
  // mkfs.btrfs -L persistence -d raid1 -m raid1 -f /dev/disk/by-id/*-part1
  await shell(`mkfs.btrfs -L persistence -d raid1 -m raid1 \
     -f ${persistancePartitions}`)
}
/**
 * Formats all blockdevices in storagepool.vdevs, then configures persistance. 
 * Existing filesystems and partitions will be destroyed, all data will be 
 * lost. Finally, a zpool will be created on the zfs partitions.
 * 
 * If storagepool.debug is true, the function execute the zpool create command 
 * with the 'n' option, it displays the configuration that would be used 
 * without actually creating the pool. The actual pool creation can still fail
 * due to insufficient privileges or device sharing.
 * @function initialSetup 
 * @async
 * @param {Object} storagepool
 * @returns {Promise<Error>} On reject
 * @returns {Promise<Message>} On resolve
 */
export async function initialSetup(storagepool) {
  if (storagepool.debug) {
    let debugMessage = ''
    try {
      storagepool = sortVdevs(storagepool)
      debugMessage = await createZpool(storagepool)
    } catch (e) {
      return Promise.reject(e)
    }
    return Promise.resolve({ message: debugMessage })
  }
  // normal setup
  let creationMessage = ''
  try {
    storagepool = sortVdevs(storagepool)
    // wipe and zap blockdevices, required if the disks 
    // have been used before, especially with btrfs
    for (const vdev of storagepool.vdevs) {
      for (const blockdevice of vdev.blockdevices) {
        await zwipeBlockDevice(`/dev/disk/by-id/${blockdevice.wwid}`)
      }
    }
    // create partitions for btrfs persistance
    await createBtrfsPersistance(storagepool)
    // in case of btrfs mount any one of the partitions labeled 'persitence' 
    // in the btrfs raid, and the raid will be automatically mounted.
    await shell(`mount \
    /dev/disk/by-id/${storagepool.vdevs[0].blockdevices[0].wwid}-part1 /mnt`)
    // configure persistance
    await shell(`echo '/etc union' > /mnt/persistence.conf`)
    await shell(`echo '/lib union' >> /mnt/persistence.conf`)
    await shell(`echo '/usr union' >> /mnt/persistence.conf`)
    await shell(`echo '/var union' >> /mnt/persistence.conf`)
    await shell(`echo '/home union' >> /mnt/persistence.conf`)
    await shell(`echo '/root union' >> /mnt/persistence.conf`)
    await shell(`echo '/srv union' >> /mnt/persistence.conf`)
    await shell(`echo '/opt union' >> /mnt/persistence.conf`)
    await shell(`mkdir -p /mnt/root/rw`)
    // create a identification file /root/setup.id file, which can be used to
    // check if the initial setup has been done.
    await shell(`echo '${storagepool.setupid}' > /mnt/root/rw/setup.id`)
    await shell(`chmod 700 /mnt/root`)
    await shell(`umount /mnt`)
    // create zpool
    creationMessage = await createZpool(storagepool)
  }
  catch (e) {
    throw e
  }
  return { message: creationMessage }
}

// example storagepool object
let example =
{
  "vdevs": [
    {
      "blockdevices": [
        {
          "kname": "sdh",
          "type": "disk",
          "path": "/dev/sdh",
          "fstype": "zfs_member",
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi1-0-1"
        },
        {
          "kname": "sdg",
          "type": "disk",
          "path": "/dev/sdg",
          "fstype": "zfs_member",
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi1-0-0"
        }
      ],
      "redundancy": "mirror",
      "type": "data-1",
      "delete": false,
      "dspares": 0
    },
    {
      "blockdevices": [
        {
          "kname": "sdf",
          "type": "disk",
          "path": "/dev/sdf",
          "fstype": null,
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1"
        },
        {
          "kname": "sde",
          "type": "disk",
          "path": "/dev/sde",
          "fstype": null,
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2"
        }
      ],
      "redundancy": "mirror",
      "type": "dedup",
      "delete": false,
      "dspares": 0
    },
    {
      "blockdevices": [
        {
          "kname": "sdd",
          "type": "disk",
          "path": "/dev/sdd",
          "fstype": null,
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3"
        },
        {
          "kname": "sdc",
          "type": "disk",
          "path": "/dev/sdc",
          "fstype": null,
          "fssize": null,
          "size": 4000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-4"
        }
      ],
      "redundancy": "stripe",
      "type": "data-2",
      "delete": false,
      "dspares": 0
    }
  ],
  "setupid": "AGA771-4",
  "debug": true
}



//test
// initialSetup(example)
//   .then((response) => {
//     console.log(`THEN`)
//     console.log(response)
//   })
//   .catch((error) => {
//     console.log(`CATCH`)
//     console.log(error)
//   }
//   )


