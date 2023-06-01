<script setup>
/**
 * The SystemSetupCarousel component is a wizard that guides the user through
 * the process of setting up the hootnas system.
 * @module SystemSetupCarousel
 * 
 */
import { get } from './storage-setup-carousel-items/shared.mjs'
import { provide, reactive, watch } from 'vue'
/**
  * @typedef systemSettings
  * @type {Object}
  * @property {String} rootpw root password
  * @property {String} hostname hostname
  * @property {String} ip fixed ip address
  * @property {String} netmask netmask
  * @property {String} gateway gateway
  * @property {String} dns dns
  * @property {Boolean} compress
  * @property {Boolean} encrypt
  * @property {String} password
  * @property {Number} capacity
  */
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
        <div class="carousel slide" data-bs-ride="false" id="carousel-system" style="width: 600px;">
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