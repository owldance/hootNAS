<script setup>
import { provide, reactive, Suspense } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/Nunito.css'
import './assets/fonts/fontawesome-all.min.css'
import * as bootstrap from 'bootstrap'
import { post } from './components/storage-setup-carousel-items/shared.mjs'
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
const appstate = reactive({ vue: 'nothing', accesstoken: '' })
provide('appstate', appstate)
/**
 * see https://jsdoc.app/tags-callback.html for the callback tag
 * @callback postCallback
 * @param {Object} data - The response body of the post request.
 * @returns {void}
 */
/**
 * Posts a request to the hootnas server to get an access token, if the
 * request is successful, it checks if the setupid is availiable on hootnas, if
 * it is, it changes the appstate.vue to 'management', if it isn't, it changes
 * the appstate.vue to 'setupStoragePool'.
 * The name/password combination is hardcoded and is used only for setup, upon 
 * completion of setup, this user is deactivated in the database.
 * 
 * await syntax is not possible here, because the parent vue file must be 
 * wrapped in Suspense tags, and App.vue doesn't have any parent.
 * @async
 * @param {string} name - The username of the hootnas server.
 * @param {string} password - The password of the hootnas server.
 * @param {postCallback} callback - The callback that handles the response of
 * the post request.
 */
post('api/getAccessToken', { name: 'Monkey', password: 'monk7y' })
  .then((data) => {
    // Check if setupid is availiable on hootnas, if it exist, change
    // appstate accordingly.
    appstate.accesstoken = data.accesstoken
    post('api/getSetupId', { accesstoken: appstate.accesstoken })
      .then((data) => {
        // setupid is availiable because storagepool is already setup
        appstate.vue = 'management'
      })
      .catch((e) => {
        if (e.message.match(/ssh|verification|network/i)) {
          console.log(`${e.message}\ncheck your connectivity and refresh the page`)
        }
        else
          // setupid is not availiable because storagepool requires setup
          appstate.vue = 'setupStoragePool'
      })
  })
  .catch((e) => {
    console.log(e.message)
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
