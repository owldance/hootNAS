/**
 * Setup all initial storage and live-boot persistance
 * @module initialSetup
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
import { zwipeBlockDevice } from "./zwipeBlockDevice.mjs"
import { createPartitions } from "./createPartitions.mjs"
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
 * Creates a zpool on the blockdevices in storagepool.vdevs. If 
 * storagepool.debug is true, the function execute the zpool create command 
 * with the 'n' option, it displays the configuration that would be used 
 * without actually creating the pool. The actual pool creation can still fail 
 * due to insufficient privileges or device sharing.
 * @function createZpool
 * @async
 * @param {storagepool} storagepool
 * @returns {Promise<Error>} On reject
 * @returns {Promise<Message>} On resolve
*/
async function createZpool(storagepool) {
  let creationMsg = ''
  try {
    let createZpoolString = ''
    if (storagepool.debug)
      createZpoolString = `zpool create -n dpool `
    else
      createZpoolString = `zpool create dpool `
    for (const vdev of storagepool.vdevs) {
      if (!vdev.type.startsWith('data'))
        createZpoolString += `${vdev.type} `
      if (vdev.redundancy !== 'stripe')
        createZpoolString += `${vdev.redundancy} `
      // get blockdevices in vdev as one string  
      createZpoolString += vdev.blockdevices.map(blockdevice => {
        if (storagepool.debug)
          return `/dev/disk/by-id/${blockdevice.wwid}`
        else
          return `/dev/disk/by-id/${blockdevice.wwid}-part2`
      }).join(' ')
      createZpoolString += ` `
    }
    creationMsg = await shell(`${createZpoolString}`)
  } catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve(creationMsg)
}

/**
 * Configures persistance on all blockdevices in storagepool.vdevs where vdev 
 * name is not 'reserved' or 'devicepool'. Existing filesystems and partitions
 * will be destroyed, all data will be lost. Then the blockdevices will be
 * partitioned and a btrfs raid1 filesystem will be created. Finally, a zpool
 * will be created on the zfs partitions.
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
 * @todo btrfs raid for persistance partitions is broken since kernel 
 * 5.19.0-42 with btrfs-progs v5.16.2. on mount, the kernel will complain 
 * about missing devices, because the udev rules calls 'btrfs device scan' 
 * which scans for devices in /dev/disk/by-uuid which udev do not create 
 * consistently.
 * see man pages for mkfs.btrfs, udev and btrfs-device.
 * 
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
    // create partitions for btrfs persistance. All partitions must be created 
    // before the persistance btrfs raid is created, otherwise, for any 
    // subsequent created partitions on the same blockdevice, the partition 
    // table on the device will be written, but the udev device manager will 
    // not update /dev directory even after a reboot.
    // for (const vdev of storagepool.vdevs) {
    //   for (const blockdevice of vdev.blockdevices) {
    //     await createPartitions(`/dev/disk/by-id/${blockdevice.wwid}`,
    //        'persistence', 'dpool')
    //   }
    // }
    // *************************************************************************
    // create partitions for ext4 persistance
    let nameExt4Part = true
    for (const vdev of storagepool.vdevs) {
      for (const blockdevice of vdev.blockdevices) {
        if (nameExt4Part) {
          // make only the first partition with name 'persistence', so we 
          // are sure that live-boot will mount the correct partition.
          await createPartitions(`/dev/disk/by-id/${blockdevice.wwid}`,
            'persistence', 'dpool')
          nameExt4Part = false
        } else {
          await createPartitions(`/dev/disk/by-id/${blockdevice.wwid}`,
            '', 'dpool')
        }
      }
    }
    // // create btrfs raid
    // // get all blockdevices in vdevs as one string 
    // let persistancePartitions = ''
    // for (const vdev of storagepool.vdevs) {
    //   for (const blockdevice of vdev.blockdevices) {
    //     persistancePartitions += `/dev/disk/by-id/${blockdevice.wwid}-part1 `
    //   }
    // }
    // await shell(`mkfs.btrfs -L persistence -d raid1 -m raid1 \
    //  -f ${persistancePartitions}`)
    // // mount and configure one persistance partition, changes will 
    // // automatically propagate to all other persistance partitions 
    // // due to above btrfs raid
    // await shell(`mount \
    // /dev/disk/by-id/${storagepool.vdevs[0].blockdevices[0].wwid}-part1 /mnt`)
    // *************************************************************************
    // create ext4 filesystem on the (one and only) persistance partition
    await shell(`mkfs.ext4 -L persistence \
    /dev/disk/by-id/${storagepool.vdevs[0].blockdevices[0].wwid}-part1`)
    await shell(`mount \
    /dev/disk/by-id/${storagepool.vdevs[0].blockdevices[0].wwid}-part1 /mnt`)
    // configure persistance
    await shell(`echo '/etc union' > /mnt/persistence.conf`)
    await shell(`echo '/usr union' >> /mnt/persistence.conf`)
    await shell(`echo '/var union' >> /mnt/persistence.conf`)
    await shell(`echo '/home union' >> /mnt/persistence.conf`)
    await shell(`echo '/root union' >> /mnt/persistence.conf`)
    await shell(`mkdir -p /mnt/root/rw`)
    // create a identification file /root/setup.id file, which can be used to
    // check if the initial setup has been done
    await shell(`echo '${storagepool.setupid}' > /mnt/root/rw/setup.id`)
    await shell(`chmod 700 /mnt/root`)
    await shell(`umount /mnt`)
    // create zpool
    creationMessage = await createZpool(storagepool)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve({ message: creationMessage })
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


