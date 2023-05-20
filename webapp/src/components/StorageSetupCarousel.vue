<script setup>
import DiskCheck from './storage-setup-carousel-items/DiskCheck.vue'
import ReservedDiskSelect from './storage-setup-carousel-items/ReservedDiskSelect.vue'
import DiskSelect from './storage-setup-carousel-items/DiskSelect.vue'
import TopologySelect from './storage-setup-carousel-items/TopologySelect.vue'
import OptionsSelect from './storage-setup-carousel-items/OptionsSelect.vue'
import TopologySelectStoragepool from './storage-setup-carousel-items/TopologySelectStoragepool.vue'
import OptionsSelectStoragepool from './storage-setup-carousel-items/OptionsSelectStoragepool.vue'
import FinalizeSetup from './storage-setup-carousel-items/FinalizeSetup.vue'
import { get, allDisksAllocated } from './storage-setup-carousel-items/shared.mjs'
import { provide, reactive, watch } from 'vue'
/** 
 * A blockdevice is a physical disk/partition on the machine
 * @typedef blockdevice
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
 */
/** 
 * vdev is a ZFS virtual device i.e. a group of blockdevices or vdevs
 * @typedef vdev
 * @type {Object}
 * @property {Array<blockdevice>|Array<vdev>} blockdevices 
 * @property {String} topology stripe|mirror|raidz1|raidz2raidz3
 * @property {String} name the unique name of this vdev
 * @property {String} compress compress data option
 * @property {String} encrypt encrypt data option
 * @property {String} password encryption password
 * @property {String} capacity calculated capacity of the vdev
 */
/**
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
 * all disks on the machine
 * @constant
 * @type {Array<blockdevice>}
 */
const disks = reactive(await get('getBlockDevices'))
/** 
 * The number of total disks on the machine
 * @constant
 * @type {Number}
 */
const totalDisks = disks.blockdevices.length
/**
 * storagepool is the primary object of this component. storagepool has two 
 * special vdevs named devicepool and reserved. 
 * 
 * devicepool contains all blockdevices on the machine. The purpose of this 
 * component is to move these blockdevice from devicepool to reserved and/or 
 * any user defined vdevs.
 * 
 * When devicepool is empty, the storage setup of the machine can be initiated.
 * 
 * @const storagepool
 * @type {vdev}
 */
const storagepool = reactive(
  {
    vdevs: [
      {
        blockdevices: disks.blockdevices,
        topology: null,
        name: 'devicepool',
        compress: null,
        encrypt: null,
        password: 'password',
        capacity: 0
      },
      {
        blockdevices: [],
        topology: null,
        name: 'reserved',
        compress: null,
        encrypt: null,
        password: 'password',
        capacity: 0
      }
    ],
    topology: null,
    name: 'AGA771-4',
    compress: null,
    encrypt: null,
    password: 'password',
    capacity: 0
  }
)
provide('storagepool', storagepool)
// watch(
//   () => storagepool.vdevs.length,
//   (current, prev) => {
//     console.log(`storagepool.vdevs.length changed from ${prev} to ${current}`)
//     storagepool.vdevs.forEach(vdev => {
//       console.log(`${vdev.name}`, vdev)
//     })
//   },
//   { deep: true }
// )

</script>

<template>
  <div class="container">
    <div class="text-center">
      <h1>Storage Setup</h1>
    </div>
    <div class="row">
      <div class="col offset-xxl-3">
        <div class="carousel slide" data-bs-ride="false" id="carousel-init" style="width: 600px;">
          <div class="carousel-inner">
            <Suspense>
              <DiskCheck />
            </Suspense>
            <Suspense>
              <!-- 
              minimum 3 disks are required to show <ReservedDiskSelect/>
              -->
              <ReservedDiskSelect v-if="totalDisks >= 3" vdevName="reserved" />
            </Suspense>
            <div v-for="vdev in storagepool.vdevs">
              <!-- 
              minimum 2 disks are required to make a vdev
              -->
              <Suspense>
                <DiskSelect v-if="!vdev.name.match('devicepool|reserved')" v-bind:vdevName=vdev.name />
              </Suspense>
              <Suspense>
                <TopologySelect v-if="!vdev.name.match('devicepool|reserved')" v-bind:vdevName=vdev.name />
              </Suspense>
              <Suspense>
                <OptionsSelect v-if="!vdev.name.match('devicepool|reserved')" v-bind:vdevName=vdev.name />
              </Suspense>
            </div>
            <!-- 
                if all disks allocated and there is minimum 4 vdevs
                ( devicepool + reserved + minimum 2 user created) 
              -->
            <Suspense v-if="storagepool.vdevs.length >= 4 && allDisksAllocated(storagepool)">
              <TopologySelectStoragepool />
            </Suspense>
            <Suspense v-if="storagepool.vdevs.length >= 4 && allDisksAllocated(storagepool)">
              <OptionsSelectStoragepool />
            </Suspense>
            <!-- 
                finally do the setup 
              -->
            <FinalizeSetup />
          </div>
        </div>
      </div>
    </div>
    <div class="text-center">
      <p>Paragraph</p>
    </div>
  </div>
</template> 

<style scoped>
</style>