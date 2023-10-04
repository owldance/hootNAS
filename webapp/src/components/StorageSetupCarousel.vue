<script setup>
/**
 * The StorageSetupCarousel component is a wizard that guides the user through
 * the process of setting up the storage pool.
 * @module components/StorageSetupCarousel
 * @typedef {import('../../../services/blockdevices/getBlockDevices.mjs').BlockDevice} BlockDevice
 * @typedef {import('../../../webserver/endpoints/users.mjs').User} User
 * @typedef {import('../App.vue').AppState} AppState
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
 * A ZFS virtual device i.e. a group of blockdevices or vdevs
 * @typedef {Object} Vdev
 * @property {Array<BlockDevice>|Array<Vdev>} devices 
 * @property {String} redundancy the redundancy level of the vdev
 * @property {String} type the type of vdev
 * @property {Boolean} delete if true, the vdev will be deleted from the storagepool
 * @property {Number} dspares number of spare devices in a vdev of type draid
 */
/**
  * @typedef {Object} StoragePool
  * @property {Array<Vdev>} vdevs
  * @property {Boolean} debug if true, the setup will be tested but not initiated
  */  

/** @type {AppState} */
const appstate = inject('appstate')

async function getBlockDevices() {
  try {
    const result = await post('api/devices/getBlockDevices',
      { accesstoken: appstate.user.accesstoken })
    return result
  } catch (e) {
    return { blockdevices: []}
  }
}
/** @type {Array<BlockDevice} */
const allDisks = await getBlockDevices()
provide('allDisks', allDisks)
/**
 * @typedef {Object} StoragePool
 * @property {Array<Vdev>} vdevs - the user defined vdevs
 * @property {Boolean} debug - if true, the setup will not be initiated
 */
/** @type {StoragePool} */
const storagepool = reactive(
  {
    vdevs: [
    ],
    debug: false
  }
)
provide('storagepool', storagepool)
</script>

<template>
  <div class="full-height">
    <p style="margin-bottom:1%">&nbsp;</p>
    <div class="d-flex justify-content-center">
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
</template> 

<style scoped></style>