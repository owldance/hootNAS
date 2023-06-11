<script setup>
/**
 * The StorageSetupCarousel component is a wizard that guides the user through
 * the process of setting up the storage pool.
 * @module StorageSetupCarousel
 * @todo use :key for VdevConfig component to force re-render when vdevs are
 * added or removed. this seems to be more appropriate than v-for
 * see https://michaelnthiessen.com/force-re-render/
 * 
 */
import DiskCheck from './storage-setup-carousel-items/DiskCheck.vue'
import VdevConfig from './storage-setup-carousel-items/VdevConfig.vue'
import FinalizeSetup from './storage-setup-carousel-items/FinalizeSetup.vue'
import { post } from './shared.mjs'
import { provide, reactive, watch, inject } from 'vue'
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
const appstate = inject('appstate')
const allDisks = reactive(await post('api/getBlockDevices',
  { accesstoken: appstate.accesstoken }))
provide('allDisks', allDisks)
/**
 * storagepool is the primary object of this component. 
 * 
 * allDisks contains all blockdevices on the machine. The purpose of this 
 * component is to copy these blockdevice to any user defined vdevs.
 * 
 * When done, the setup of the storage pool can be initiated.
 * 
 * @const storagepool
 * @type {vdev}
 */
const storagepool = reactive(
  {
    vdevs: [
    ],
    setupid: 'AGA771-4',
    debug: false
  }
)
provide('storagepool', storagepool)

// uncomment for debugging
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
            <div v-for="vdev in storagepool.vdevs">
              <Suspense>
                <VdevConfig v-bind:vdevType=vdev.type />
              </Suspense>
            </div>
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

<style scoped></style>