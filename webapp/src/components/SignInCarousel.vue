<script setup>
/**
 * The SignInCarousel component is a wizard that guides the user through
 * the process of signing in or creating an account on the hootnas system.
 * @module SignInCarousel
 * 
 */
import { post } from './shared.mjs'
import { inject } from 'vue'
const appstate = inject('appstate')
</script>

<template>
  <div class="container">
    <div class="text-center">
      <h1>Sing in or create account</h1>
    </div>
    
    <div class="row">
      <div class="col offset-xxl-3">
        <div class="carousel slide" data-bs-ride="false" id="carousel-signin" style="width: 330px;">
          <div class="carousel-inner">
            <div class="carousel-item active" id="signin">
              <div class="card">
                <div class="card-body">
                  <h4 id="signin-check-title" class="card-title">Sign In or Create Account
                  </h4>
                  <h6 id="signin-check-subtitle" class="text-muted card-subtitle mb-2">Your choice...
                  </h6>
                  <p id="signin-check-text" class="card-text">bla bla bla</p>
                  <div class="row">

                  </div>
                  <div>
                    <div class="mb-2">
                      <label for="exampleInputEmail1" class="form-label">Email address</label>
                      <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
                      <div id="emailHelp" class="form-text">bla bla bla.</div>
                    </div>
                    <div class="mb-2">
                      <label for="exampleInputPassword1" class="form-label">Password</label>
                      <input type="password" class="form-control" id="exampleInputPassword1">
                    </div>
                    <div class="mb-2 form-check">
                      <input type="checkbox" class="form-check-input" id="exampleCheck1">
                      <label class="form-check-label" for="exampleCheck1">Check me out</label>
                    </div>
                    <div class="col text-end">
                      <button class="btn btn-primary" id="signin-button" disabled="false" type="button">Sign In</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 

<style scoped></style>