<script setup>
/**
 * The StorageSetupCarousel component is a wizard that guides the user through
 * the process of setting up the storage pool.
 * @module components/StorageSetupCarousel
 * @typedef {import('../../../services/blockdevices/getBlockDevices.mjs').BlockDevice} BlockDevice
 * @typedef {import('../../../services/blockdevices/initialSetup.mjs').Vdev} Vdev
 * @typedef {import('../../../services/blockdevices/initialSetup.mjs').StoragePool} StoragePool
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
import { provide, reactive, inject } from 'vue'
/** @type {AppState} */
const appstate = inject('appstate')
async function getBlockDevices() {
  try {
    const result = await post('api/devices/getBlockDevices',
      { accesstoken: appstate.user.accesstoken })
    return result
  } catch (e) {
    return { devices: []}
  }
}
/** @type {Array<BlockDevice} */
const allDisks = await getBlockDevices()
provide('allDisks', allDisks)
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