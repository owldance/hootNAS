<script setup>
import { toHumanReadable, sortedDisks, diskInfo, vdevIndexOf } from './shared.mjs'
import { inject, nextTick, onMounted } from 'vue'
const storagepool = inject('storagepool')

// declare properties
const props = defineProps({
    vdevName: String
})
onMounted(() => {
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})
/** 
 * The vdev index of the vdev name passed on to this componenet in props
 * @constant
 * @type {Number}
 */
 const thisVdevIndex = vdevIndexOf(props.vdevName, storagepool)
/**
 * Add/remove disk to/from this vdev 
 * @function
 * @listens v-on:change:checked
 * @param {Object} event native DOM event object
 */
function checkboxChange(event) {
    const disk = diskInfo(event.target.id, storagepool, thisVdevIndex)
    if (event.target.checked) {
        // copy disk to this vdev
        storagepool.vdevs[thisVdevIndex].blockdevices.push(
            storagepool.vdevs[disk.vdevIndex].blockdevices[disk.index]
        )
        // remove disk from source
        storagepool.vdevs[disk.vdevIndex].blockdevices.splice(disk.index, 1)
    } else {
        // copy disk back to devicepool
        storagepool.vdevs[vdevIndexOf('devicepool', storagepool)].blockdevices.push(
            storagepool.vdevs[disk.vdevIndex].blockdevices[disk.index]
        )
        // remove disk from this vdev
        storagepool.vdevs[disk.vdevIndex].blockdevices.splice(disk.index, 1)
    }
}
/**
 * Go to previous carouselItem
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
function goPrev(event) {
    // go to prev
    const carousel = new bootstrap.Carousel(
        document.getElementById('carousel-init'))
    carousel.prev()
}
/**
 * Go to next vdev if not all disks are assigned to storagepool
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
async function goNext(event) {
    // advance to next carouselItem 
    const carousel = new bootstrap.Carousel(
        document.getElementById('carousel-init'))
    carousel.next()
}
</script>

<template>
    <div class="carousel-item" v-bind:id="props.vdevName">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Select which disks to reserve</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Reserve disks if they contain data you
                    want to preserve, or use them later as hot spares. With hot
                    spares you can replace failed drives in your storage
                    pool through the admin panel. Hot spares are especially
                    beneficial if your hootNAS is at a remote location, or it
                    takes a considerable amount of time to procure and install
                    new disks.</p>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Selected</th>
                                <th>Available disks</th>
                                <th>Capacity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="disk in sortedDisks(storagepool)">
                                <td class="text-center">
                                    <input
                                        v-if="diskInfo(disk.kname, storagepool, thisVdevIndex).selectedHere"
                                        v-on:change="checkboxChange"
                                        class="form-check-input" type="checkbox"
                                        name="disk-selector"
                                        v-bind:id="disk.kname" checked>
                                    <input
                                        v-else-if="diskInfo(disk.kname, storagepool, thisVdevIndex).vdevName.match('devicepool|reserved')"
                                        v-on:change="checkboxChange"
                                        class="form-check-input" type="checkbox"
                                        name="disk-selector"
                                        v-bind:id="disk.kname">
                                    <input v-else class="form-check-input"
                                        type="checkbox" name="disk-selector"
                                        v-bind:id="disk.kname" checked disabled>
                                </td>
                                <td>{{ disk.kname }}</td>
                                <td>{{ toHumanReadable(disk.size) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row">
                    <div class="col text-start">
                        <button class="btn btn-primary"
                            id="disk-selector-prev-button" type="button"
                            v-on:click="goPrev">Prev</button>
                    </div>
                    <div class="col text-end">
                        <button class="btn btn-primary"
                            id="disk-selector-next-button" type="button"
                            v-on:click="goNext">Next</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style>
.custom-tooltip {
    --bs-tooltip-bg: var(--bs-primary);
}

.warning-tooltip {
    --bs-tooltip-bg: var(--bs-red);
}
</style>