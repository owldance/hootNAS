<script setup>
import { provide, reactive, Suspense } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/css/Nunito.css'
import './assets/fonts/fontawesome-all.min.css'
import * as bootstrap from 'bootstrap'
import { post } from './components/shared.mjs'
import StorageSetupCarousel from './components/StorageSetupCarousel.vue'
import SignIn from './components/SignIn.vue'
import DashBoard from './components/DashBoard.vue'
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
 * it is, it changes the appstate.vue to 'signIn', if it isn't, it changes
 * the appstate.vue to 'setupStoragePool'.
 * 
 * await syntax is not possible here, because the parent vue file must be 
 * wrapped in Suspense tags, and App.vue doesn't have any parent.
 * @async
 * @param {string} name - The username of the hootnas server.
 * @param {string} password - The password of the hootnas server.
 * @param {postCallback} callback - The callback that handles the response of
 * the post request.
 */
// Check if persistence is active
post('api/isPersistenceActive')
  .then((data) => {
    // persistence is active
    appstate.vue = 'signIn'
  })
  .catch((e) => {
    if (e.message.match(/ssh|verification|network/i)) {
      console.log(`${e.message}\ncheck your connectivity and refresh the page`)
      return
    }
    // persistence is not active, this requires setup.
    // need to get accesstoken first, the name/password is hardcoded and is 
    // used only for setup, upon setup completion, this user is deactivated.
    post('api/getAccessToken', { name: 'Monkey', password: 'monk7y' })
      .then((data) => {
        appstate.accesstoken = data.accesstoken
        appstate.vue = 'setupStoragePool'
      }).catch((e) => {
        console.log(e.message)
      })
  })

</script>

<template>
  <header>
  </header>
  <main>
    <!-- <p>appstate.vue: {{ appstate.vue }}</p> -->
    <Suspense>
      <DashBoard v-if="appstate.vue === 'dashBoard'" />
    </Suspense>
    <h1 v-if="appstate.vue === 'nothing'">waiting</h1>
    <Suspense>
      <SignIn v-if="appstate.vue === 'signIn'" />
    </Suspense>
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
