<script setup>
/**
 * This is the dashboard component
 * @module dashboard
 */
'use strict'
import { post } from './shared.mjs'
import { inject, ref } from 'vue'
const appstate = inject('appstate')

</script>

<template>
<nav class="navbar navbar-expand-lg bg-primary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">hootNAS</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
    data-bs-target="#navbarNavDropdown" >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavDropdown">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Shares</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Users</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
</template> 

<style scoped>
.navbar .container-fluid, 
.navbar-expand-lg .navbar-collapse, 
.navbar-expand-lg .navbar-nav{
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
  
  </style>