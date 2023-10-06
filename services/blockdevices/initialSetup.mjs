/**
 * Setup all initial storage and live-boot persistance
 * @module initialSetup
 * @todo deactivate OneTimeUser account in the database
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
import { zwipeBlockDevice } from "./zwipeBlockDevice.mjs"
import { createZpool } from "../zfs/createZpool.mjs"
import { createZvol } from "../zfs/createZvol.mjs"
import { createZfs } from "../zfs/createZfs.mjs"
import { getSettings } from "../utilities/getSettings.mjs"
/** @typedef {import('./getBlockDevices.mjs').BlockDevice} BlockDevice */
/** 
 * A ZFS virtual device i.e. a group of blockdevices or vdevs
 * @typedef {Object} Vdev
 * @property {Array<BlockDevice>|Array<Vdev>} devices 
 * @property {String} redundancy the redundancy level of the vdev
 * @property {String} type the type of vdev
 * @property {Boolean} delete delete vdev from the storagepool, this is only 
 * for use in the webapp vue components, has no meaning in the api.
 * @property {Number} dspares number of spare devices in a vdev of type draid
 */
/**
 * @typedef {Object} StoragePool
 * @property {Array<Vdev>} vdevs - the user defined vdevs
 * @property {Boolean} debug - if true, the setup will only be tested, but not
 * executed.
 */
/**
 * Sorts storagepool.vdevs by type and redundancy, so that the order becomes:
 * 1. vdevs of type 'data' with redundancy 'stripe'
 * 2. vdevs of type 'data' with any other redundancy
 * 3. vdevs of any type with any redundancy 
 * @function sortVdevs
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
 * Configures persistence by creating a zvol, formatting it with ext4, 
 * mounting it to /mnt, and creating a persistence.conf file.
 * @function configurePersistence
 * @async
 * @throws {Error} If any of the shell commands fail.
 */
async function configurePersistence() {
  try {
    const settings = await getSettings()
    await createZvol(`1G`,
      `${settings.storagepoolname}/${settings.persistencezvolname}`)
    // the volume is exported as a block device in /dev/zvol/path
    await shell(`mkfs.ext4 -L persistence /dev/zd0`)
    await shell(`mount /dev/zd0 /mnt`)
    // mounts must be an absolute path containing neither the "." nor ".." 
    // special dirs, and cannot be "/lib", or "/run/live" or any of its 
    // sub-directories. mounts can not have the same or nested sources 
    // e.g. "/a" and "/a/b" are not allowed.
    await shell(`echo '/etc union' > /mnt/persistence.conf`)
    await shell(`echo '/usr union' >> /mnt/persistence.conf`)
    await shell(`echo '/var union' >> /mnt/persistence.conf`)
    await shell(`echo '/home union' >> /mnt/persistence.conf`)
    await shell(`echo '/root union' >> /mnt/persistence.conf`)
    await shell(`echo '/srv union' >> /mnt/persistence.conf`)
    await shell(`echo '/opt union' >> /mnt/persistence.conf`)
    await shell(`mkdir -p /mnt/root/rw`)
    // create a identification file /root/setup.id file, which can be used by
    // the webapp to check if the initial setup is working.
    //await shell(`echo '${storagepool.setupid}' > /mnt/root/rw/setup.id`)
    await shell(`echo BFA7824 > /mnt/root/rw/setup.id`)
    await shell(`chmod 700 /mnt/root`)
    await shell(`umount /mnt`)
  } catch (e) {
    throw e
  }
}

/**
 * Creates a storagepoolname and configures persistance. Existing filesystems 
 * and partitions will be destroyed, all data will be lost.
 * 
 * If storagepool.debug is true, the function execute the storagepoolname 
 * create command with the 'n' option, it displays the configuration that would 
 * be used without actually creating the pool. The actual pool creation can 
 * still fail due to insufficient privileges or device sharing.
 * @function initialSetup 
 * @async
 * @param {Object} storagepool
 * @returns {Message} On resolve
 * @throws {Error} On reject
 */
export async function initialSetup(storagepool) {
    if (storagepool.debug) {
      try {
        storagepool = sortVdevs(storagepool)
        const debugMessage = await createZpool(storagepool)
        return { message: debugMessage }
      } catch (e) {
        throw e
      }
    }
    // normal setup
    try {
      const settings = await getSettings()
      storagepool = sortVdevs(storagepool)
      // wipe and zap blockdevices, required if the disks have been used before
      for (const vdev of storagepool.vdevs) {
        for (const blockdevice of vdev.devices) {
          await zwipeBlockDevice(`/dev/disk/by-id/${blockdevice.wwid}`)
        }
      }
      const creationMessage = await createZpool(storagepool)
      await configurePersistence()
      // create the root zfs filesystem
      await createZfs(`${settings.storagepoolname}/${settings.datafsname}`,
        undefined,
        { mountpoint: `/${settings.datafsname}` })
      return { message: creationMessage }
    }
    catch (e) {
      throw e
    }
}