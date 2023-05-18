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
 * Filter vdevs in storagepool.vdevs, exclude vdev.name 'reserved' 
 * or 'devicepool'.
 * @function getVdevs
 * @param {Object} storagepool
 * @returns {Array<vdev>}
 */
function getFilteredVdevs(storagepool) {
  const vdevs = []
  storagepool.vdevs.forEach(vdev => {
    if (!vdev.name.match(/reserved|devicepool/)) {
      vdevs.push(vdev)
    }
  })
  return vdevs
}
/**
 * Configures persistance on all blockdevices in storagepool.vdevs where vdev 
 * name is not 'reserved' or 'devicepool'. Existing filesystems and partitions
 * will be destroyed, all data will be lost. Then the blockdevices will be
 * partitioned and a btrfs raid1 filesystem will be created. Finally, a zpool
 * will be created on the zfs partitions.
 * @function initialSetup 
 * @async
 * @param {Object} storagepool
 * @returns {Promise<Error>} On reject
 * @returns {Promise<Message>} On resolve
 */
export async function initialSetup(storagepool) {
  try {
    const vdevs = getFilteredVdevs(storagepool)
    // wipe and zap blockdevices, required if the disks 
    // have been used before, especially with btrfs
    for (const vdev of vdevs) {
      for (const blockdevice of vdev.blockdevices) {
        await zwipeBlockDevice(`/dev/disk/by-id/${blockdevice.wwid}`)
      }
    }
    // create required partitions. All partitions must be created before the
    // persistance btrfs raid is created, otherwise, for any subsequent created
    // partitions on the same blockdevice, the partition table on the device 
    // will be written, but the device manager will not update /dev directory 
    // even after a reboot.
    for (const vdev of vdevs) {
      for (const blockdevice of vdev.blockdevices) {
        await createPartitions(`/dev/disk/by-id/${blockdevice.wwid}`,
          `${vdev.name}`)
      }
    }
    // get all blockdevices in vdevs as one string 
    let persistancePartitions = ''
    for (const vdev of vdevs) {
      for (const blockdevice of vdev.blockdevices) {
        persistancePartitions += `/dev/disk/by-id/${blockdevice.wwid}-part1 `
      }
    }
    // create btrfs raid
    await shell(`mkfs.btrfs -L persistence -d raid1 -m raid1 \
     -f ${persistancePartitions}`)
    // mount and configure one persistance partition, changes will 
    // automatically propagate to all other persistance partitions 
    // due to above btrfs raid
    await shell(`mount \
    /dev/disk/by-id/${vdevs[0].blockdevices[0].wwid}-part1 /mnt`)
    await shell(`echo '/etc union' > /mnt/persistence.conf`)
    await shell(`echo '/usr union' >> /mnt/persistence.conf`)
    await shell(`echo '/var union' >> /mnt/persistence.conf`)
    await shell(`echo '/home union' >> /mnt/persistence.conf`)
    await shell(`echo '/root union' >> /mnt/persistence.conf`)
    await shell(`mkdir -p /mnt/root/rw`)
    // create a identification file /root/setup.id file, which can be used to
    // check if the initial setup has been done
    // @todo use a uuid instead of the storagepool name
    await shell(`echo '${storagepool.name}' > /mnt/root/rw/setup.id`)
    await shell(`chmod 700 /mnt/root`)
    await shell(`umount /mnt`)
    // create zpool
    let createZpoolString = `zpool create dpool `
    for (const vdev of vdevs) {
      createZpoolString += `${vdev.topology} `
      // get blockdevices in vdev as one string  
      createZpoolString += vdev.blockdevices.map(blockdevice => {
        return `/dev/disk/by-id/${blockdevice.wwid}-part2`
      }).join(' ')
      createZpoolString += ` `
    }
    await shell(`${createZpoolString}`)
  }
  catch (e) {
    return Promise.reject(e)
  }
  return Promise.resolve({ message: 'initial setup done, please rebooot' })
}


// example storagepool object
let example = {
  "vdevs": [
    {
      "blockdevices": [],
      "topology": null,
      "name": "devicepool",
      "compress": null,
      "encrypt": null,
      "password": "password",
      "capacity": 0
    },
    {
      "blockdevices": [],
      "topology": null,
      "name": "reserved",
      "compress": null,
      "encrypt": null,
      "password": "password",
      "capacity": 0
    },
    {
      "blockdevices": [
        {
          "kname": "sda",
          "type": "disk",
          "path": "/dev/sda",
          "fstype": null,
          "fssize": null,
          "size": 10000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-4"
        },
        {
          "kname": "sdb",
          "type": "disk",
          "path": "/dev/sdb",
          "fstype": null,
          "fssize": null,
          "size": 10000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-3"
        }
      ],
      "topology": "mirror",
      "name": "abc",
      "compress": "compress",
      "encrypt": null,
      "password": "password",
      "capacity": 20000000000
    },
    {
      "blockdevices": [
        {
          "kname": "sdc",
          "type": "disk",
          "path": "/dev/sdc",
          "fstype": null,
          "fssize": null,
          "size": 10000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-2"
        },
        {
          "kname": "sdd",
          "type": "disk",
          "path": "/dev/sdd",
          "fstype": null,
          "fssize": null,
          "size": 10000000000,
          "mountpoint": null,
          "parttype": null,
          "partuuid": null,
          "partlabel": null,
          "wwn": null,
          "vendor": "QEMU    ",
          "rev": "2.5+",
          "wwid": "scsi-0QEMU_QEMU_HARDDISK_drive-scsi0-0-0-1"
        }
      ],
      "topology": "mirror",
      "name": "def",
      "compress": "compress",
      "encrypt": null,
      "password": "password",
      "capacity": 10000000000
    }
  ],
  "topology": "mirror",
  "name": null,
  "compress": true,
  "encrypt": true,
  "password": "fg4r5g345543gbh4",
  "capacity": 10000000000
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


