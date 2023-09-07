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
                <i class="fs-4 bi-house"></i> <span class="ms-1 d-none d-sm-inline" v-on:click="showCard"
                  id="settings">Settings</span>
              </a>
            </li>
            <!-- #submenu1 -->
            <li>
              <a href="#submenu1" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-speedometer2"></i> <span class="ms-1 d-none d-sm-inline">Dashboard</span> </a>
              <ul class="collapse show nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">Item</span> 1 </a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">Item</span> 2 </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-table"></i> <span class="ms-1 d-none d-sm-inline">Orders</span></a>
            </li>
            <!-- #submenu2 -->
            <li>
              <a href="#submenu2" data-bs-toggle="collapse" class="nav-link px-0 align-middle ">
                <i class="fs-4 bi-bootstrap"></i> <span class="ms-1 d-none d-sm-inline">Bootstrap</span></a>
              <ul class="collapse nav flex-column ms-1" id="submenu2" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">Item</span> 1</a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">Item</span> 2</a>
                </li>
              </ul>
            </li>
            <!-- shares submenu -->
            <li>
              <a href="#shares" data-bs-toggle="collapse" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-grid"></i> <span class="ms-1 d-none d-sm-inline">Shares</span> </a>
              <ul class="collapse nav flex-column ms-1" id="shares" data-bs-parent="#menu">
                <li class="w-100">
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline" v-on:click="showCard"
                      id="nfs">NFS</span> 1</a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">SMB</span> 2</a>
                </li>
                <li>
                  <a href="#" class="nav-link px-0"> <span class="d-none d-sm-inline">iSCSI</span> 3</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#" class="nav-link px-0 align-middle">
                <i class="fs-4 bi-people"></i> <span class="ms-1 d-none d-sm-inline">Customers</span> </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="col py-3">
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
        <div class="card" style="width: 18rem;" id="nfs-card" v-bind:class="{ 'd-none': cardHidden.nfs }">
          <div class="card-header">
            Featured
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" checked>
                <label class="form-check-label" for="nfs-ro">Share is Read Only</label>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="nfs-sync" checked>
                <label class="form-check-label" for="nfs-sync">Reply to requests only after the changes have been committed to storage.</label>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" checked>
                <label class="form-check-label" for="nfs-ro">Share is Read Only</label>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" checked>
                <label class="form-check-label" for="nfs-ro">Share is Read Only</label>
              </div>

            </li>
            <li class="list-group-item">A second item</li>
            <li class="list-group-item">A third item</li>
          </ul>
        </div>
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
}</style>