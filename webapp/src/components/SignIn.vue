<script setup>
/**
 * The SignInCarousel component is a wizard that guides the user through
 * the process of signing in or creating an account on the hootnas system.
 * @module SignIn
 * @todo check if name is already taken
 * @todo check if mail is already taken
 * @todo check if name/password/mail is valid before enabling action button
 */
'use strict'
import { post } from './shared.mjs'
import { inject, ref } from 'vue'
const appstate = inject('appstate')
// clear accesstoken
appstate.accesstoken = ''
/**
 * The createChecked ref is used to determine if the user wants to create an
 * account or sign in.
 * @constant
 * @type {Object} 
 */
const createChecked = ref(false)
/**
 * Listens to the change event of the create account checkbox and changes the
 * text of the action button accordingly.
 * @function createChanged
 * @listens  v-on:change:checked
 * @param {Event} event 
 */
function createChanged(event) {
  const actionButton = document.getElementById('action-button')
  if (event.target.checked) {
    actionButton.innerText = 'Create Account'
  } else {
    actionButton.innerText = 'Sign In'
  }
  createChecked.value = !createChecked.value
}
/**
 * Checks if the name input is POSIX compliant and minimum 6 characters including 
 * uppercase and lowercase letters, numbers and underscores.
 * @function checkName
 * @param {Event} event - The input event.
 */
function checkName(event) {
  const nameInput = document.getElementById('name-input')
  const nameHelp = document.getElementById('name-help')
  const actionButton = document.getElementById('action-button')
  const name = nameInput.value
  if (name.match(/^[a-zA-Z0-9_]{6,}$/)) {
    nameHelp.innerText = 'ok'
    nameHelp.style.color = 'green'
    actionButton.disabled = false
  } else {
    nameHelp.innerText = 'Minimum 6 characters including uppercase and lowercase letters, numbers and underscores'
    nameHelp.style.color = 'red'
    actionButton.disabled = true
  }
}
/**
 * Checks if the password input is POSIX compliant and minimum 8 characters 
 * whereof minimum 1 uppercase character and 1 number.
 * @function checkPassword
 * @param {Event} event - The input event.
 */
function checkPassword(event) {
  const passwordInput = document.getElementById('password-input')
  const passwordHelp = document.getElementById('password-help')
  const actionButton = document.getElementById('action-button')
  const password = passwordInput.value
  if (password.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/)) {
    passwordHelp.innerText = 'ok'
    passwordHelp.style.color = 'green'
    actionButton.disabled = false
  } else {
    passwordHelp.innerText = 'Minimum 8 characters, 1 upppercase letter and 1 number'
    passwordHelp.style.color = 'red'
    actionButton.disabled = true
  }
}
/**
 * Checks if the mail input is valid.
 * @function checkMail
 * @param {Event} event - The input event.
 */
function checkMail(event) {
  const mailInput = document.getElementById('mail-input')
  const mailHelp = document.getElementById('mail-help')
  const actionButton = document.getElementById('action-button')
  const mail = mailInput.value
  if (mail.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
    mailHelp.innerText = 'ok'
    mailHelp.style.color = 'green'
    actionButton.disabled = false
  } else {
    mailHelp.innerText = 'Invalid mail address'
    mailHelp.style.color = 'red'
    actionButton.disabled = true
  }
}
/**
 * @typedef {Object} User
 * @property {String} name
 * .... etc 
 * @property {Array<String>} groups group names
 */
/**
 * Signs in or creates an account on the hootnas server.
 * @function signIn
 * @listens  v-on:click
 * @param {Event} event 
 */
async function signIn() {
  const nameInput = document.getElementById('name-input')
  const passwordInput = document.getElementById('password-input')
  const mailInput = document.getElementById('mail-input')
  const actionButton = document.getElementById('action-button')
  let user = {}
  try {
    if (createChecked.value){
      user = await post('api/createAccount', {
        name: nameInput.value,
        password: passwordInput.value, mail: mailInput.value
      })}
    else
      user = await post('api/getAccessToken', {
        name: nameInput.value,
        password: passwordInput.value
      })
    appstate.accesstoken = user.accesstoken
    appstate.vue = 'dashBoard'
  }
  catch (e) {
    console.log(e.message)
  }
}
</script>

<template>
  <div class="d-flex justify-content-center">
    <div class="card " style="width: 330px;">
      <div class="card-body">
        <h4 id="signin-check-title" class="card-title">Sign In or Create Account
        </h4>
        <h6 id="signin-check-subtitle" class="text-muted card-subtitle mb-2">Your choice...
        </h6>
        <p id="signin-check-text" class="card-text">bla bla bla</p>
        <div>
          <div class="mb-2">
            <label for="name-input" class="form-label">Name</label>
            <input type="email" class="form-control" id="name-input" v-on:input="checkName">
            <div id="name-help" class="form-text">Minimum 8 characters</div>
          </div>
          <div class="mb-2">
            <label for="password-input" class="form-label">Password</label>
            <input type="password" class="form-control" id="password-input" v-on:input="checkPassword">
            <div id="password-help" class="form-text">Minimum 8 characters, 1 upppercase letter and 1 number</div>
          </div>
          <div class="mb-2 form-check">
            <input type="checkbox" class="form-check-input" id="create-account-check" v-on:change="createChanged">
            <label class="form-check-label" for="create-account-check">Create an account for me</label>
          </div>
          <div class="mb-2" v-if="createChecked">
            <label for="mail-input" class="form-label">Email address</label>
            <input type="email" class="form-control" id="mail-input" v-on:input="checkMail">
            <div id="mail-help" class="form-text">bla bla bla.</div>
          </div>
          <div class="col text-end">
            <button class="btn btn-primary" id="action-button" disabled="true" type="button" v-on:click="signIn">Sign
              In</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 

<style scoped></style>