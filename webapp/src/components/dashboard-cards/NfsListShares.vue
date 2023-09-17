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
 * @property {String} modified default datetime
 * @property {String} created default datetime
 * @property {String} name a user assigned identifier, default null
 * @property {String} desc description, default null
 * @property {String} clients client list, default null
 * @property {String} size_limit default 0
 * @property {String} expert_config default null
 * @property {Boolean} kerb_auth default false
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
import NfsShare from './NfsShare.vue'
import { post } from '../shared.mjs'
import { inject, onMounted, reactive, provide, ref } from 'vue'
const appstate = inject('appstate')
// get the user's NFS shares
const nfsShares = reactive(await post('api/selectNfsByUserId', {
    accesstoken: appstate.user.accesstoken,
    userid: appstate.user.id
}))
// template for a new NFS share
const nfsShareTemplate = {
  id: 0,
  name: null,
  desc: null,
  clients: null,
  size_limit: 0,
  expert_config: null,
  kerb_auth: false,
  sec: null,
  ro: true,
  sync: true,
  wdelay: true,
  hide: true,
  crossmnt: null,
  subtree_check: false,
  secure_locks: true,
  mountpoint: null,
  fsid: null,
  nordirplus: false,
  refer: null,
  replicas: null,
  pnfs: false,
  security_label: false,
  root_squash: true,
  all_squash: false,
  anonuid: null,
  anongid: null
}
// clone the nfsShareTemplate object to the reactive nfsShareCopy object
const nfsShareCopy = reactive({ ...nfsShareTemplate })
let selectedShareId = 0

function toggleRowActive(event) {
    selectedShareId = event.target.attributes.shareid.value
    // remove active class from all elements that are "selectable"
    console.log(`selectedShareId = ${selectedShareId}`)
    let selectableElements = document.querySelectorAll('.nfs-tr-select')
    selectableElements.forEach((element) => {
        element.classList.remove('table-active')
    })
    // add active class to clicked element's parent <tr>
    event.target.parentElement.classList.add('table-active')
}
function showEditModal() {
    if (selectedShareId == 0)
        return
    const selectedShare = nfsShares.find((share) => share.id == selectedShareId)
    // clone the selected share object to the nfsShareCopy object
    for (const key in selectedShare) {
        if (Object.hasOwn(nfsShareCopy, key)) {
            nfsShareCopy[key] = selectedShare[key]
        }
    }
    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
    myModal.show()
}

function showNewModal() {
    // reset the nfsShareCopy object
    for (const key in nfsShareTemplate) {
        nfsShareCopy[key] = nfsShareTemplate[key]
    }
    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
    myModal.show()
}

function applyEdit() {
    if (nfsShareCopy.id == 0) {
        // add new share
        nfsShares.push({...nfsShareCopy})
        return
    }
    const originalShare = nfsShares.find((share) => share.id == nfsShareCopy.id)
    // compare the original share with the modified share
    for (const key in originalShare) {
        // ignore properties not in the nfsShareCopy object
        if (nfsShareCopy[key] !== undefined && originalShare[key] !== nfsShareCopy[key]) {
            console.log(`Property ${key} is different: originalShare.${key} = ${originalShare[key]}, nfsShareCopy.${key} = ${nfsShareCopy[key]}`)
            originalShare[key] = nfsShareCopy[key]
        }
    }
}
// onMounted(() => {
//     // add click event to all "selectable" elements
//     // note: although the <tr> is the element that is "selectable", it is the 
//     // child <th> element that is clicked and therefore returned.
//     // const selectableElements = document.querySelectorAll('.nfs-tr-select')
//     // selectableElements.forEach((element) => {
//     //     element.addEventListener('click', toggleRowActive)
//     // })
// })
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
                        <tr class="nfs-tr-select" v-for="share in nfsShares" v-on:click="toggleRowActive">
                            <th scope="row" v-bind:shareid="share.id" >{{ share.name }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.path }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.desc }}</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="showEditModal()">Edit</button>
            <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="showNewModal()">New</button>
            <button type="button" class="btn btn-danger btn-sm">Delete</button>
        </div>
    </div>
    <!-- Modal -->
    <div class="modal fade " id="staticBackdrop" data-bs-keyboard="false" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">NFS configuration</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <NfsShare v-model:name="nfsShareCopy.name" 
                    v-model:desc="nfsShareCopy.desc"
                    v-model:clients="nfsShareCopy.clients" 
                    v-model:size_limit="nfsShareCopy.size_limit"
                    v-model:expert_config="nfsShareCopy.expert_config"
                    v-model:kerb_auth="nfsShareCopy.kerb_auth"
                    v-model:path="nfsShareCopy.path"
                    v-model:sec="nfsShareCopy.sec" 
                    v-model:ro="nfsShareCopy.ro"
                    v-model:sync="nfsShareCopy.sync"
                    v-model:wdelay="nfsShareCopy.wdelay"
                    v-model:hide="nfsShareCopy.hide"
                    v-model:crossmnt="nfsShareCopy.crossmnt"
                    v-model:subtree_check="nfsShareCopy.subtree_check"
                    v-model:secure_locks="nfsShareCopy.secure_locks"
                    v-model:mountpoint="nfsShareCopy.mountpoint"
                    v-model:fsid="nfsShareCopy.fsid"
                    v-model:nordirplus="nfsShareCopy.nordirplus"
                    v-model:refer="nfsShareCopy.refer"
                    v-model:replicas="nfsShareCopy.replicas"
                    v-model:pnfs="nfsShareCopy.pnfs"
                    v-model:security_label="nfsShareCopy.security_label"
                    v-model:root_squash="nfsShareCopy.root_squash"
                    v-model:all_squash="nfsShareCopy.all_squash"
                    v-model:anonuid="nfsShareCopy.anonuid"
                    v-model:anongid="nfsShareCopy.anongid"
                    />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="applyEdit()">Apply</button>
                    <button type="button" class="btn btn-secondary btn-sm me-1" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary btn-sm me-1">Understood</button>
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

