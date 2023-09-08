<script setup>
/**
 * This is the dashboard component
 * @module DashBoard
 */
import NfsShareAdd from './dashboard-cards/NfsShareAdd.vue'
import { post } from './shared.mjs'
import { inject, ref, reactive } from 'vue'
const appstate = inject('appstate')
const cardHidden = reactive({
  users: true,
  groups: true,
  shares: true,
  nfs: true,
  settings: true
})
function showCard(event) {
  // set cardhidden.id to false, all others to true
  for (const key in cardHidden) {
    if (Object.hasOwn(cardHidden, key)) {
      if (key === event.target.id) {
        cardHidden[key] = false
      } else {
        cardHidden[key] = true
      }
    }
  }
}
</script>

<template>
  <!-- https://dev.to/codeply/bootstrap-5-sidebar-examples-38pb -->
  <div class="container-fluid">
    <div class="row flex-nowrap">
      <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
        <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
          <a href="#" class="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
            <span class="fs-5 d-none d-sm-inline">Menu</span>
          </a>
          <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
            <li class="nav-item">
              <a href="#" class="nav-link align-middle px-0">
                <i class="fs-4 bi-gear"></i> <span class="ms-1 d-none d-sm-inline" v-on:click="showCard"
                  id="settings">Settings</span>
              </a>
            </li>
            <!-- metrics submenu -->
            <li>
              <a href="#metrics" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-speedometer2"></i> <span class="ms-1 d-none d-sm-inline">Metrics</span> </a>
              <ul class="collapse nav flex-column ms-1" id="metrics" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="metrics-disk">Disk</span></a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="metrics-network">Network</span></a>
                </li>
              </ul>
            </li>
            <!-- shares submenu -->
            <li>
              <a href="#shares" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-share"></i> <span class="ms-1 d-none d-sm-inline">Shares</span> </a>
              <ul class="collapse nav flex-column ms-1" id="shares" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="nfs">NFS</span></a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="smb">SMB</span></a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="iscsi">iSCSI</span></a>
                </li>
              </ul>
            </li>
            <!-- users submenu -->
            <li>
              <a href="#users" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-people"></i> <span class="ms-1 d-none d-sm-inline">Users</span> </a>
              <ul class="collapse nav flex-column ms-1" id="users" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="users">Users</span></a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="groups">Groups</span></a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
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
        <div class="card text-bg-danger mb-3" style="max-width: 18rem;" id="settings-card"
          v-bind:class="{ 'd-none': cardHidden.settings }">
          <div class="card-header">Settings</div>
          <div class="card-body">
            <h5 class="card-title">Settings card title</h5>
            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's
              content.</p>
          </div>
        </div>

        <NfsShareAdd v-if="!cardHidden.nfs" />

      </div>
    </div>
  </div>
</template> 

<style scoped>
.card {
  position: relative;
  top: 100px;
  left: 100px;
}

.nav-link:hover,
.nav-link:focus {
  color: #bdbdbd;
}
</style>