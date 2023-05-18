<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { provide, reactive, watch, Suspense } from 'vue'
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
 * Check if there exist a partition named 'persistence', if it exist, change
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
      // check yyour connectivity
      console.log(e.message)
    }
    else {
      console.log(e.message)
      appstate.vue = 'setup'
    }
  })

</script>

<template>
  <header>
  </header>
  <main>
    <p>appstate.vue: {{ appstate.vue }}</p>
    <h1 v-if="appstate.vue === 'management'">setup complete, vue management
      component goes here</h1>
    <h1 v-if="appstate.vue === 'nothing'">waiting</h1>
    <Suspense>
      <StorageSetupCarousel v-if="appstate.vue === 'setup'" />
    </Suspense>
  </main>
</template>

<style scoped></style>
