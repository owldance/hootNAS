<script setup>
/**
 * This is the dashboard component
 * @module DashBoard
 */
'use strict'
import { post } from './shared.mjs'
import { inject, ref, reactive } from 'vue'
const appstate = inject('appstate')
const cardHidden = reactive({
  users: true,
  groups: true,
  shares: true,
  settings: true
})
function setNavLinkActive(elementId) {
  const navLinks = document.querySelectorAll('.nav-link')
  navLinks.forEach(link => {
    // If the link ID matches the clicked ID, add the 'active' class
    if (link.id === elementId) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
}
function showCard(id) {
  setNavLinkActive(id)
  // set cardhidden.id to false, all others to true
  for (const key in cardHidden) {
    if (Object.hasOwn(cardHidden, key)) {
      if (key === id) {
        cardHidden[key] = false
      } else {
        cardHidden[key] = true
      }
    }
  }
}
function onUsers(event) {
  showCard(event.target.id)
}
function onGroups(event) {
  showCard(event.target.id)
}
function onShares(event) {
  showCard(event.target.id)
}
function onSettings(event) {
  showCard(event.target.id)
}
</script>

<template>
  <div class="row">
    <div class="col">
      <nav class="navbar navbar-expand-lg bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">hootNAS</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="onUsers" id="users">Users</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="onGroups" id="groups">Groups</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="onShares" id="shares">Shares</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" v-on:click="onSettings" id="settings">Settings</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                  aria-expanded="false">
                  Dropdown link
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">Action</a></li>
                  <li><a class="dropdown-item" href="#">Another action</a></li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
    <div class="col">
      <div class="card text-bg-primary mb-3" style="max-width: 18rem;" id="users-card"
        v-bind:class="{ 'd-none': cardHidden.users }">
        <div class="card-header">Users</div>
        <div class="card-body">
          <h5 class="card-title">Users card title</h5>
          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
            content.</p>
        </div>
      </div>
      <div class="card text-bg-secondary mb-3" style="max-width: 18rem;" id="groups-card"
        v-bind:class="{ 'd-none': cardHidden.groups }">
        <div class="card-header">Groups</div>
        <div class="card-body">
          <h5 class="card-title">Groups card title</h5>
          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
            content.</p>
        </div>
      </div>
      <div class="card text-bg-success mb-3" style="max-width: 18rem;" id="shares-card"
        v-bind:class="{ 'd-none': cardHidden.shares }">
        <div class="card-header">Shares</div>
        <div class="card-body">
          <h5 class="card-title">Shares card title</h5>
          <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
            content.</p>
        </div>
      </div>
    </div>
    <div class="card text-bg-danger mb-3" style="max-width: 18rem;" id="settings-card"
      v-bind:class="{ 'd-none': cardHidden.settings }">
      <div class="card-header">Settings</div>
      <div class="card-body">
        <h5 class="card-title">Settings card title</h5>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
          content.</p>
      </div>
    </div>
  </div>
</template> 

<style scoped>
.navbar .container-fluid,
.navbar-expand-lg .navbar-collapse,
.navbar-expand-lg .navbar-nav {
  flex-direction: column;
  align-items: flex-start;
}

.navbar {
  width: 200px;
  align-items: flex-start;
  height: 100vh;
}

.navbar-brand {
  margin-left: 0.5em;
  padding-bottom: 0;
  border-bottom: 4px solid #464646;
}

.card-container {
  position: relative;
}

.card {
  position: absolute;
  top: 100px;
  left: 300px;
}
</style>