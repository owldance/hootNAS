<script setup>
import { inject, nextTick } from 'vue';
import { get, createNewDefaultVdev, allDisksAllocated } from './shared.mjs'
const storagepool = inject('storagepool')

// give user some time to read
setTimeout(() => {
    const button = document.getElementById('disk-check-button')
    const title = document.getElementById('disk-check-title')
    const subtitle = document.getElementById('disk-check-subtitle')
    const text = document.getElementById('disk-check-text')
    if (!allDisksAllocated(storagepool)) {
        button.disabled = false
        button.innerHTML = 'Next'
        title.innerHTML = "Success"
        subtitle.innerHTML = "Found some disks"
        text.innerHTML = "You are good to go, press next to continue"
        button.addEventListener('click', async () => {
            // create new vdev
            createNewDefaultVdev(storagepool)
            // wait for DOM update
            await nextTick()
            const carousel = new bootstrap.Carousel(
                document.getElementById('carousel-init'))
            carousel.next()
        })
    } else {
        // there are no disks
        button.disabled = false
        button.innerHTML = 'Shutdown'
        button.addEventListener('click', () => {
            get('initiateShutdown')
            button.disabled = true
        })
        title.innerHTML = 'Sorry'
        subtitle.innerHTML = 'No disks found'
        text.innerHTML = `If you are using VMware, set 
        <em>disk.EnableUUID="TRUE" </em>in the vmx configuration file or in 
        the vsphere configuration. <br><br>
        If you are using QEMU/KVM, make sure you are using virtual SATA or SCSI 
        disk (and not VirtIO). Alternatively set a unique serial number on 
        each virtual disk using libvirt or qemu e.g.: <br><em>-drive
            if=none,id=disk1,file=disk1.qcow2,serial=1234567890</em>`
    }
}, 1000)

</script>

<template>
    <div class="carousel-item active" id="disk-check">
        <div class="card">
            <div class="card-body">
                <h4 id="disk-check-title" class="card-title">Checking for disks
                </h4>
                <h6 id="disk-check-subtitle"
                    class="text-muted card-subtitle mb-2">Wait a moment...
                </h6>
                <p id="disk-check-text" class="card-text">Looking for disk
                    UUID's registered
                    in /dev/disk/by-id</p>
                <div class="row">
                    <div class="col text-end">
                        <button class="btn btn-primary" id="disk-check-button"
                            disabled="true" type="button">Wait</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style>

</style>