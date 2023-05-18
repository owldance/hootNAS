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
 * Updates this vdev name in storagepool.
 * @function
 * @listens v-on:change:vdev-name
 * @param {Object} event native DOM event object
 * @todo check validity of name
 */
function vdevNameChanged(event) {
    // must pass vdev name check
    if (!checkVdevName(event.target.value))
        return
    storagepool.vdevs[thisVdevIndex].name = event.target.value
}
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
 * check that vdev name is unique, and not 'default' and consists only of
 * [a-zA-Z0-9_.-] and is min 3 max 30 chars. if not, focus on input field, 
 * then show the tooltip.
 * @function
 * @param {String} vdev name to check
 * @returns {Boolean} true if test passes, otherwise false
 */
function checkVdevName(newVdevName) {
    // check that name is unique, and not 'default' and consists only of
    // [a-zA-Z0-9_.-] and is min 3 max 30 chars
    if (
        vdevIndexOf(newVdevName, storagepool) !== -1 &&
        !newVdevName.match(
            /^[a-zA-Z0-9_.-]{3,30}(?<!default|devicepool|reserved)$/m
        )
    ) {
        // if not, focus on input field, then show the tooltip
        const inputField = document.getElementById(`vdev-name-${props.vdevName}`)
        inputField.focus()
        const tooltip = bootstrap.Tooltip.getInstance(`#vdev-name-${props.vdevName}`)
        tooltip.show()
        // hide toolip after timeout
        setTimeout(() => {
            tooltip.hide()
        }, 2000)
        return false
    }
    return true
}
/**
 * Go to previous carouselItem, if there are no disks selected here, remove 
 * this vdev from storagepool
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
function goPrev(event) {
    // go to prev
    const carousel = new bootstrap.Carousel(
        document.getElementById('carousel-init'))
    carousel.prev()
    // if there are no disks selected here, remove this vdev from storagepool
    if (!storagepool.vdevs[thisVdevIndex].blockdevices.length) {
        storagepool.vdevs.splice(thisVdevIndex, 1)
    }
}
/**
 * Go to next carouselItem
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
function goNext(event) {
    // make sure vdev name passes check
    if (!checkVdevName(storagepool.vdevs[thisVdevIndex].name))
        return
    // show tooltip if there are less than 2 disks selected here
    if (storagepool.vdevs[thisVdevIndex].blockdevices.length < 2) {
        const tooltip = bootstrap.Tooltip.getInstance(
            `#select-disks-tooltip-${props.vdevName}`)
        tooltip.show()
        // hide toolip after timeout
        setTimeout(() => {
            tooltip.hide()
        }, 2000)
    }
    // otherwise advance to next carouselItem 
    else {
        const carousel = new bootstrap.Carousel(
            document.getElementById('carousel-init'))
        carousel.next()
    }
}
</script>

<template>
    <div class="carousel-item" v-bind:id="props.vdevName">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Select which disks to use</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Nullam id dolor id nibh ultricies vehicula
                    ut id elit. Cras justo odio, dapibus ac facilisis in,
                    egestas eget quam.
                    Donec id elit non mi porta gravida at eget metus.</p>
                <label class="form-label" id="vdev-label"
                    v-bind:for="`vdev-name-${props.vdevName}`"
                    data-bs-toggle="tooltip" data-bs-trigger="hover"
                    data-bs-placement="right"
                    data-bs-custom-class="custom-tooltip"
                    data-bs-title="The name of the vdev must be 3-30 characters long, consisting of a-z A-Z 0-9 _.- and the name must be unique, 'default' is not allowed"
                    data-bs-container="body">VDEV
                    name<i class="fas fa-info-circle"></i>&nbsp;&nbsp;</label>
                <input v-on:change="vdevNameChanged" type="text"
                    v-bind:id="`vdev-name-${props.vdevName}`"
                    v-bind:placeholder="props.vdevName"
                    v-bind:value="props.vdevName" data-bs-toggle="tooltip"
                    data-bs-trigger="manual" data-bs-placement="right"
                    data-bs-custom-class="warning-tooltip"
                    data-bs-title="The name of the vdev must be 3-30 characters long, consisting of a-z A-Z 0-9 _.- and the name must be unique, 'default' is not allowed"
                    data-bs-container="body" />
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th v-bind:id="`select-disks-tooltip-${props.vdevName}`"
                                    class="text-center" data-bs-toggle="tooltip"
                                    data-bs-trigger="manual"
                                    data-bs-placement="right"
                                    data-bs-custom-class="warning-tooltip"
                                    data-bs-title="You must select at least 2 disks"
                                    data-bs-container="body">Selected</th>
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
                                        v-else-if="diskInfo(disk.kname, storagepool, thisVdevIndex).vdevName.match('devicepool')"
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