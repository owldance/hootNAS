<script setup>
/**
 * This is the nfsListShares component, it produces a list of all the user's 
 * NFS shares which can be managed by the user.
 * @module nfsListShares
 * @typedef {import('../../../../services/nfs/insertNfsExport.mjs').NfsExport} NfsExport
 * @typedef {import('../../../../db/executeQueryRun.mjs').QueryResult'} QueryResu1t
 */
'use strict'
import NfsShare from './NfsShare.vue'
import { post } from '../shared.mjs'
import { inject, reactive } from 'vue'

const appstate = inject('appstate')
// get the user's NFS shares
/** @type {Array<NfsExport>} All the user's shares from the database */
const nfsShares = reactive(await post('api/nfs/selectNfsExportsByUserId', {
    accesstoken: appstate.user.accesstoken, user_id: appstate.user.id
}))
/** 
 * @const {NfsExport} nfsShareTemplate A template for a new NFS share with 
 * property id=0 and user_id=appstate.user.id, otherwise all other properties 
 * set to default values as per database schema.
 */
const nfsShareTemplate = {
    id: 0,
    user_id: appstate.user.id,
    status_id: 1,
    modified: undefined,
    created: undefined,
    name: undefined,
    desc: undefined,
    clients: undefined,
    quota: 0,
    expert_config: undefined,
    kerb_auth: false,
    path: undefined,
    sec: undefined,
    ro: true,
    sync: true,
    wdelay: true,
    hide: true,
    crossmnt: undefined,
    subtree_check: false,
    secure_locks: true,
    mountpoint: undefined,
    fsid: undefined,
    nordirplus: false,
    refer: undefined,
    replicas: undefined,
    pnfs: false,
    security_label: false,
    root_squash: true,
    all_squash: false,
    anonuid: undefined,
    anongid: undefined
}
/** @const {NfsExport} nfsShareClone reactive clone of nfsShareTemplate */
const nfsShareClone = reactive({ ...nfsShareTemplate })
/** @type {number} keeps track of which share the user have selected in <tr> */
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
    // copy the selected share object to the nfsShareClone object
    for (const key in selectedShare) {
        if (Object.hasOwn(nfsShareClone, key)) {
            nfsShareClone[key] = selectedShare[key]
        }
    }
    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
    myModal.show()
}
function showNewModal() {
    // reset the nfsShareClone object
    for (const key in nfsShareTemplate) {
        nfsShareClone[key] = nfsShareTemplate[key]
    }
    const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
    myModal.show()
}
async function deleteShare() {
    if (selectedShareId == 0)
        return
    // delete the share from the database
    /** @typedef {QueryResu1t} nfsQueryResult */
    const nfsQueryResult = await post('api/nfs/removeNetworkFileShare', {
        accesstoken: appstate.user.accesstoken, id: selectedShareId
    })
    // remove the share from the reactive nfsShares array
    const index = nfsShares.findIndex((share) => share.id == selectedShareId)
    if (index > -1) {
        nfsShares.splice(index, 1)
    }
}
async function applyEdit() {
    if (nfsShareClone.id == 0) {
        nfsShareClone.user_id = appstate.user.id
        /** @type {QueryResult} */
        const result = await post('api/nfs/createNetworkFileShare', {
            accesstoken: appstate.user.accesstoken, nfsExport: nfsShareClone
        })
        nfsShareClone.id = result.lastID
        // clone nfsShareClone and add it to the reactive nfsShares array
        nfsShares.push({ ...nfsShareClone })
    } else {
        // update an existing share
        /** @type {NfsExport} reactive copy of the share in nfsShares */
        const originalShare = nfsShares.find((share) => share.id == nfsShareClone.id)
        /** @type {NfsExport} Properties in originalShare that are not the same 
         * in nfsShareClone, excluding undefined, but retain the id */
        const changedProperties = Object.keys(nfsShareClone).reduce((acc, key) => {
            if (key === 'id' ||
                nfsShareClone[key] !== originalShare[key] &&
                nfsShareClone[key] !== undefined) {
                acc[key] = nfsShareClone[key]
            }
            return acc
        }, {})
        // if changedProperties is not an empty object, update the share 
        if (Object.keys(changedProperties).length > 1) {
            /** @typedef {QueryResu1t} nfsQueryResult */
            const nfsQueryResult = await post('api/nfs/modifyNetworkFileShare', {
                accesstoken: appstate.user.accesstoken,
                nfsExport: changedProperties
            })
            // update the share in the reactive nfsShares array
            for (const key in changedProperties) {
                if (Object.hasOwn(originalShare, key)) {
                    originalShare[key] = changedProperties[key]
                }
            }
        }
    }
}
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
                            <th scope="row" v-bind:shareid="share.id">{{ share.name }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.path }}</th>
                            <th scope="row" v-bind:shareid="share.id">{{ share.desc }}</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="showEditModal()">Edit</button>
            <button type="button" class="btn btn-primary btn-sm me-1" v-on:click="showNewModal()">New</button>
            <button type="button" class="btn btn-danger btn-sm me-1" v-on:click="deleteShare()">Delete</button>
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
                    <NfsShare v-model:name="nfsShareClone.name" v-model:desc="nfsShareClone.desc"
                        v-model:clients="nfsShareClone.clients" v-model:quota="nfsShareClone.quota"
                        v-model:expert_config="nfsShareClone.expert_config" v-model:kerb_auth="nfsShareClone.kerb_auth"
                        v-model:path="nfsShareClone.path" v-model:sec="nfsShareClone.sec" v-model:ro="nfsShareClone.ro"
                        v-model:sync="nfsShareClone.sync" v-model:wdelay="nfsShareClone.wdelay"
                        v-model:hide="nfsShareClone.hide" v-model:crossmnt="nfsShareClone.crossmnt"
                        v-model:subtree_check="nfsShareClone.subtree_check"
                        v-model:secure_locks="nfsShareClone.secure_locks" v-model:mountpoint="nfsShareClone.mountpoint"
                        v-model:fsid="nfsShareClone.fsid" v-model:nordirplus="nfsShareClone.nordirplus"
                        v-model:refer="nfsShareClone.refer" v-model:replicas="nfsShareClone.replicas"
                        v-model:pnfs="nfsShareClone.pnfs" v-model:security_label="nfsShareClone.security_label"
                        v-model:root_squash="nfsShareClone.root_squash" v-model:all_squash="nfsShareClone.all_squash"
                        v-model:anonuid="nfsShareClone.anonuid" v-model:anongid="nfsShareClone.anongid" />
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

