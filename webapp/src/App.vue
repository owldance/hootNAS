<script setup>
import { provide, reactive, Suspense } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/Nunito.css'
import './assets/fonts/fontawesome-all.min.css'
import * as bootstrap from 'bootstrap'
import { get } from './components/storage-setup-carousel-items/shared.mjs'
import StorageSetupCarousel from './components/StorageSetupCarousel.vue'
// when bootstrap is not imported via the <script> tag in HTML, the bootstrap 
// namespace is not on the window object
window.bootstrap = bootstrap
/** 
 * Determines which vue component should be rendered, it 
 * defaults to 'nothing', which means nothing except the basic template
 * in this file should be rendered.
 * @constant
 * @type {Object} 
 */
const appstate = reactive({ vue: 'nothing' })
provide('appstate', appstate)
/** 
 * Check if setupid is availiable on hootnas, if it exist, change
 * appstate accordingly.
 *  
 * can't use await syntax here, because the parent vue file must be wrapped in 
 * Suspense tags, and App.vue doesn't have any parent.
 */
get('getSetupId')
  .then((data) => {
    console.log(data.message)
    appstate.vue = 'management'
  })
  .catch((e) => {
    if (e.message.match(/ssh|verification/)) {
      // check your connectivity
      console.log(e.message)
    }
    else {
      console.log(e.message)
      appstate.vue = 'setupStoragePool'
    }
  })

</script>

<template>
  <header>
  </header>
  <main class="full-height">
    <p>appstate.vue: {{ appstate.vue }}</p>
    <h1 v-if="appstate.vue === 'management'">setup complete, vue management
      component goes here</h1>
    <h1 v-if="appstate.vue === 'nothing'">waiting</h1>
    <Suspense>
      <StorageSetupCarousel v-if="appstate.vue === 'setupStoragePool'" />
    </Suspense>
  </main>
</template>

<style>
body {
  background: url("assets/img/white-h-trans.svg") center / contain no-repeat,
    linear-gradient(rgb(0, 0, 0), rgb(9, 1, 122));
  font-family: 'Nunito', sans-serif;
}
.full-height {
  height: 100vh;
}
h1 {
  color: #eeebeb;
  font-weight: bold;
  margin-bottom: 1em;
}
</style>
