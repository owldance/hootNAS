<script setup>
/**
 * This is the dashboard component
 * @module nfsListShares
 */
'use strict'
import { post } from '../shared.mjs'
import { inject, onMounted } from 'vue'
const appstate = inject('appstate')
console.log(appstate)
function toggleRowActive(event) {
    console.log(event)
    console.log(event.target.attributes.shareid.value)
    // remove active class from all elements with class "selectable"
    let selectableElements = document.querySelectorAll('.selectable')
    selectableElements.forEach((element) => {
        element.classList.remove('table-active')
    })
    // add active class to clicked element parent <tr>
    event.target.parentElement.classList.add('table-active')
}
onMounted(() => {
    // add click event to all elements with class "selectable"
    let selectableElements = document.querySelectorAll('.selectable')
    selectableElements.forEach((element) => {
        element.addEventListener('click', toggleRowActive)
    })
})

let shares = await post('api/selectNfsByUserId', {
    accesstoken: appstate.user.accesstoken,
    userid: appstate.user.id
})
console.log(shares)


</script>

<template>
    <div class="card w-50">
        <div class="card-body">
            <div id="shares">
                <h5 class="card-title">NFS Shares</h5>
                <p class="card-subtitle">A list of your sharres </p>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Path</th>
                            <th scope="col">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="selectable" v-for="share in shares">
                            <th scope="row" v-bind:shareid="share.id">{{ share.name }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.path }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.desc }}</th>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button type="button" class="btn btn-primary btn-sm me-1">Add</button>
            <button type="button" class="btn btn-primary btn-sm me-1">Edit</button>
            <button type="button" class="btn btn-danger btn-sm">Delete</button>
        </div>
    </div>
</template>
<style>
.selectable {
    cursor: pointer;
}
</style>

