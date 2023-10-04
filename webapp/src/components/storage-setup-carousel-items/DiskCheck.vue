<script setup>
/**
 * The DiskCheck component checks if there are any disks available on the
 * system. If there are, the user can continue to the next carousel item.
 * @module components/storage-setup-carousel-items/DiskCheck
 * @todo check for minimum number of disks
 * @todo check storagepool devices for existing partitions. if there are
 * existing partitions, and user accepts to delete them, delete them from 
 * storagepool and continue. otherwise exit.
 * @todo check for existing zfs and persistence partions on the disks. if there
 * are existing partitions, and user accepts to delete them, zwipe disks. 
 * otherwise exit.
*/
import { inject, nextTick, onMounted } from 'vue'
import { post, sleep } from '../shared.mjs'
/** @typedef {import('../StorageSetupCarousel.vue').StoragePool} StoragePool */
/** @type {StoragePool} */
const storagepool = inject('storagepool')
/** @typedef {import('../../../../services/blockdevices/getBlockDevices.mjs').BlockDevice} BlockDevice */
/** @type {Array<BlockDevice>} */
const allDisks = inject('allDisks')
/** @typedef {import('../../App.vue').AppState} AppState */
/** @type {AppState} */
const appstate = inject('appstate')
let button, title, subtitle, text

function foundSomeDisks() {
    button.disabled = false
    button.innerHTML = 'Next'
    title.innerHTML = "Success"
    subtitle.innerHTML = "Found some disks"
    text.innerHTML = "You are good to go, press next to continue"
    button.addEventListener('click', async () => {
        /** @typedef {import('../StorageSetupCarousel.vue').Vdev} Vdev */
        /** @type {Vdev} */
        const dataVdev = {
            devices: [],
            redundancy: 'stripe',
            type: 'data-1',
            delete: false,
            dspares: 0
        }
        // push the new data vdev to the reactive storagepool object.
        // Then the StorageSetupCarousel component renders a carousel item for
        // each vdev in storagepool, which will trigger a DOM update.
        storagepool.vdevs.push(dataVdev)
        // wait for DOM update
        await nextTick()
        // get the carousel instance and move to the next carousel item, which
        // is the VdevConfig component based on the vdev we just pushed to
        // storagepool
        const carousel = new bootstrap.Carousel(
            document.getElementById('carousel-init'))
        carousel.next()
    })
}
function noDisksFound() {
    button.disabled = false
    button.innerHTML = 'Shutdown'
    title.innerHTML = 'Sorry'
    subtitle.innerHTML = 'No disks found'
    text.innerHTML = `If you are using VMware, set 
    <em>disk.EnableUUID="TRUE" </em>in the vmx configuration file or in 
    the vsphere configuration. <br><br>
    If you are using QEMU/KVM, make sure you are using virtual SATA or SCSI 
    disk (and not VirtIO). Alternatively set a unique serial number on 
    each virtual disk using libvirt or qemu e.g.: <br><em>-drive
        if=none,id=disk1,file=disk1.qcow2,serial=1234567890</em>`
    button.addEventListener('click', async () => {
        try {
            await post('api/system/shutdownSystem',
                { accesstoken: appstate.user.accesstoken })
            title.innerHTML = 'System has been shut down'
            button.disabled = true
        } catch (e) {
            console.log(e)
        }
    })
}
onMounted(async () => {
    // give user some time to read the text
    await sleep(4000)
    button = document.getElementById('disk-check-button')
    title = document.getElementById('disk-check-title')
    subtitle = document.getElementById('disk-check-subtitle')
    text = document.getElementById('disk-check-text')
    if (allDisks.length)
        foundSomeDisks()
    else
        noDisksFound()
})
</script>

<template>
    <div class="carousel-item active" id="disk-check">
        <div class="card">
            <div class="card-body">
                <h4 id="disk-check-title" class="card-title">Checking for disks
                </h4>
                <h6 id="disk-check-subtitle" class="text-muted card-subtitle mb-2">Wait a moment...
                </h6>
                <p id="disk-check-text" class="card-text">Looking for disk
                    WWID's registered
                    in /dev/disk/by-id</p>
                <div class="row">
                    <div class="col text-end">
                        <button class="btn btn-primary" id="disk-check-button" disabled="true" type="button">Wait</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style></style>