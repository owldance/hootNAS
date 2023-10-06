<script setup>
/**
 * @file App.vue is the main vue file, it is the entry point of the application.
 * @typedef {import('../../webserver/endpoints/users.mjs').User} User
 */
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
 * @typedef {Object} AppState
 * @property {string} vue - the name of the vue component to render
 * @property {User} user - the user object including an access token
 */
/** @type {AppState} */
const appstate = reactive({ vue: 'nothing', user: null })
provide('appstate', appstate)
/**
 * Checks if persistence is active i.e. a storage setup has been performed, 
 * then changes appstate.vue to 'SignIn' which reactively loads the component.
 * Otherwise signs in with a one-time user account and changes appstate.vue to 
 * 'StorageSetupCarousel' which reactively loads the component. 
 * 
 * await syntax is not possible here, because the parent vue file must be 
 * wrapped in Suspense tags, and App.vue doesn't have any parent.
 */
post('api/system/isPersistenceActive',{}, 40000)
  .then((data) => {
    // persistence is active
    appstate.vue = 'SignIn'
  })
  .catch((e) => {
    if (e.message.match(/ssh/i)) {
      console.log("The webserver is running in development mode, \n" +
        "and it can't connect to a running hootNAS instance.\n" +
        e.message)
      return
    }
    if (e.message.match(/verification|network/i)) {
      if (location.port === '80' || location.port === '') {
        // we are in production
        console.log("Can't connect to a running hootNAS instance.\n" +
        e.message)
      }
      else {
        // we are in development
        console.log("The webserver is probably not running, \n" +
        "or there are network issues.\n" +
        e.message)
      }
      return
    }
    if (e.name === 'AbortError') {
      console.log('Fetch request timed out')
      return
    }
    // persistence is not active, this requires setup. sign in with a one-time
    // user account and change appstate.vue to 'StorageSetupCarousel'
    post('api/users/signIn', { name: 'OneTimeUser', password: 'Zn05z1mfk7y' })
      .then((data) => {
        appstate.user = data
        appstate.vue = 'StorageSetupCarousel'
      }).catch((e) => {
        console.log(e.message)
      })
  })
</script>

<template>
  <header>
  </header>
  <main v-if="appstate.vue !== 'nothing'">
    <Suspense>
      <DashBoard v-if="appstate.vue === 'DashBoard'" />
    </Suspense>
    <Suspense>
      <SignIn v-if="appstate.vue === 'SignIn'" />
    </Suspense>
    <Suspense>
      <StorageSetupCarousel v-if="appstate.vue === 'StorageSetupCarousel'" />
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
