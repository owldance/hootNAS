<script setup>
/**
 * This is the nfsListShares component, it produces a list of all the user's 
 * NFS shares which can be managed by the user.
 * @module nfsListShares
 */
/**
 * @typedef {Object} Share
 * @property {Number} id
 * @property {Number} user_id
 * @property {String} name a user assigned identifier, default null
 * @property {String} desc description, default null
 * @property {String} path default null
 * @property {String} sec default null
 * @property {Boolean} ro default true
 * @property {Boolean} sync default true
 * @property {Boolean} wdelay default true
 * @property {Boolean} hide default true
 * @property {Boolean} crossmnt default null
 * @property {Boolean} subtree_check default false
 * @property {Boolean} secure_locks default true
 * @property {String} mountpoint default null
 * @property {String} fsid default null
 * @property {Boolean} nordirplus default false
 * @property {String} refer default null
 * @property {String} replicas default null
 * @property {Boolean} pnfs default false
 * @property {Boolean} security_label default false
 * @property {Boolean} root_squash default true
 * @property {Boolean} all_squash default false
 * @property {Number} anonuid default null
 * @property {Number} anongid default null
 */

/**
 * @typedef {Object} Shares
 * @property {Array<Share>} share a NFS share
 */
'use strict'
import NfsShareAdd from './NfsShareAdd.vue'
import { post } from '../shared.mjs'
import { inject, onMounted, reactive, provide, ref } from 'vue'
const appstate = inject('appstate')

const nfsShares = reactive(await post('api/selectNfsByUserId', {
    accesstoken: appstate.user.accesstoken,
    userid: appstate.user.id
}))
provide('nfsShares', nfsShares)
const shareid = ref(0)
let selectedShare = 0

function toggleRowActive(event) {
    shareid.value = event.target.attributes.shareid.value
    selectedShare = event.target.attributes.shareid.value
    console.log(`selectedShare ${selectedShare}`)
    // remove active class from all elements that are "selectable"
    let selectableElements = document.querySelectorAll('.nfs-tr-select')
    selectableElements.forEach((element) => {
        element.classList.remove('table-active')
    })
    // add active class to clicked element's parent <tr>
    event.target.parentElement.classList.add('table-active')
}

function showModal() {
    if (selectedShare != 0) {
        const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
        myModal.show()
    }
}
function applyEdit() {
    console.log(`applyEdit ${selectedShare}`)
}
onMounted(() => {
    // add click event to all "selectable" elements
    // note: although the <tr> is the element that is "selectable", it is the 
    // child <th> element that is clicked and therefore returned.
    const selectableElements = document.querySelectorAll('.nfs-tr-select')
    selectableElements.forEach((element) => {
        element.addEventListener('click', toggleRowActive)
    })
})




</script>

<template>
    <div class="card w-50 nfs-card">
        <div class="card-body">
            <div id="nfsShares">
                <h5 class="card-title">NFS Shares</h5>
                <p class="card-subtitle">A list of your shares </p>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Path</th>
                            <th scope="col">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- note: although the <tr> is the element that is "selectable", it is the 
                             child <th> element that is clicked and therefore returned to the eventlistner. -->
                        <tr class="nfs-tr-select" v-for="share in nfsShares">
                            <th scope="row" v-bind:shareid="share.id">{{ share.name }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.path }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.desc }}</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="showModal()">Edit</button>
            <button type="button" class="btn btn-primary btn-sm me-1">Add</button>
            <button type="button" class="btn btn-danger btn-sm">Delete</button>
        </div>
    </div>
    <!-- Modal -->
    <div class="modal fade " id="staticBackdrop" data-bs-keyboard="false" tabindex="-1" >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">NFS configuration</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <NfsShareAdd v-bind:shareid="selectedShare" />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="applyEdit()">Apply</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Understood</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.nfs-tr-select {
    cursor: pointer;
}

.nfs-card {
    position: relative;
    top: 100px;
    left: 100px;
}
</style>

