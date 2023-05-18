<script setup>
import { toHumanReadable } from './shared.mjs'
import { inject, onMounted } from 'vue'
const storagepool = inject('storagepool')

// declare properties
const props = defineProps({
    vdevName: String
})
/**
 * Sets up eventlisteners for all tooltips and popovers in DOM
 * @function
 * @listens onMounted fires after the component has been mounted
 */
onMounted(() => {
    const popoverTriggerList = document.querySelectorAll(
        '[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(
        popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})
/* get this vdev index by name
*/
const thisVdevIndex = storagepool.vdevs.findIndex(({ name }) =>
    name === props.vdevName)
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
}
/**
 * Go to next carouselItem
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
async function goNext(event) {
    // show tooltip if no topology is selected
    if (!storagepool.vdevs[thisVdevIndex].topology) {
        const tooltip = bootstrap.Tooltip
            .getInstance(`#select-topology-tooltip-${props.vdevName}`)
        tooltip.show()
        // hide toolip after timeout
        setTimeout(() => {
            tooltip.hide()
        }, 2000)
    } else {
        // advance to next carouselItem
        const carousel = new bootstrap.Carousel(
            document.getElementById('carousel-init'))
        carousel.next()
    }
}
/**
 * Returns the smallest size disk in Kb of all disks in this vdev
 * @function
 * @returns {Number} the smallest size disk in Kb 
 */
function minDiskSize() {
    // make array of sizes
    const sizes = storagepool.vdevs[thisVdevIndex].blockdevices.map(o => o.size)
    // find min 
    return Math.min(...sizes)
}
/**
 * Returns the compund size of all disks (in Kb) of all disks in this vdev
 * @function
 * @returns {Number} compund size in Kb 
 */
function compoundCapacity() {
    return storagepool.vdevs[thisVdevIndex].blockdevices.reduce(
        (accumulator, currentValue) => accumulator + currentValue.size, 0)
}
/**
 * Updates the topology for this vdev in storagepool.
 * @function
 * @listens v-on:change:topology-radio
 * @param {Object} event native DOM event object
 */
function topologyChanged(event) {
    // extract topology from id
    const topology = event.target.id.match(/[^-]*/m)[0]
    switch (topology) {
        case 'stripe':
            storagepool.vdevs[thisVdevIndex].capacity = disksInThisVdev()
                * minDiskSize()
            break
        case 'mirror':
            storagepool.vdevs[thisVdevIndex].capacity = minDiskSize()
            break
        case 'raidz1':
            storagepool.vdevs[thisVdevIndex].capacity = (disksInThisVdev() - 1)
                * minDiskSize()
            break
        case 'raidz2':
            storagepool.vdevs[thisVdevIndex].capacity = (disksInThisVdev() - 2)
                * minDiskSize()
            break
        case 'raidz3':
            storagepool.vdevs[thisVdevIndex].capacity = (disksInThisVdev() - 3)
                * minDiskSize()
            break
    }
    storagepool.vdevs[thisVdevIndex].topology = topology
}
/**
 * An alias for <template> code readability reasons, that return the 
 * the number of disks in this vdev.
 * @function
 * @returns {Number} the number of disks in this vdev
 */
function disksInThisVdev() {
    return storagepool.vdevs[thisVdevIndex].blockdevices.length
}
</script>

<template>
    <div class="carousel-item" v-bind:id="props.vdevName">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">{{ props.vdevName }} topology</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Nullam id dolor id nibh ultricies vehicula
                    ut id elit. Cras justo odio, dapibus ac facilisis in,
                    egestas eget quam. Donec id elit non mi porta gravida at
                    eget metus.</p>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th v-bind:id="`select-topology-tooltip-${props.vdevName}`"
                                    class="text-center" data-bs-toggle="tooltip"
                                    data-bs-trigger="manual"
                                    data-bs-placement="right"
                                    data-bs-custom-class="warning-tooltip"
                                    data-bs-title="You must select a topology"
                                    data-bs-container="body">Selected</th>
                                <th>Topology</th>
                                <th>Capacity</th>
                                <th data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Speed gain compared to a single disk"
                                    data-bs-custom-class="custom-tooltip">
                                    Speed gain<i class="fas fa-info-circle"></i>
                                </th>
                                <th data-bs-toggle="tooltip"
                                    data-bs-placement="top" title="Number of disks that can fail 
without causing any data loss" data-bs-custom-class="custom-tooltip">
                                    Fault tolerance<i
                                        class="fas fa-info-circle"></i></th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-if="disksInThisVdev() >= 2">
                                <td><input v-on:change="topologyChanged"
                                        v-bind:name="`topology-radio-${props.vdevName}`"
                                        v-bind:id="`stripe-${props.vdevName}`"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>stripe</td>
                                <td>{{ toHumanReadable(disksInThisVdev()
                                        * minDiskSize())
                                }}</td>
                                <td>{{ `${disksInThisVdev()}x read/write` }}
                                </td>
                                <td>none</td>
                            </tr>
                            <tr v-if="disksInThisVdev() >= 2">
                                <td><input v-on:change="topologyChanged"
                                        v-bind:name="`topology-radio-${props.vdevName}`"
                                        v-bind:id="`mirror-${props.vdevName}`"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>mirror</td>
                                <td>{{ toHumanReadable(minDiskSize()) }}
                                </td>
                                <td>{{ `${disksInThisVdev()}x read` }}</td>
                                <td v-if="disksInThisVdev() === 2">
                                    1 disk</td>
                                <td v-else>
                                    {{ `${disksInThisVdev() - 1} disks` }}</td>
                            </tr>
                            <tr v-if="disksInThisVdev() >= 3">
                                <td><input v-on:change="topologyChanged"
                                        v-bind:name="`topology-radio-${props.vdevName}`"
                                        v-bind:id="`raidz1-${props.vdevName}`"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz1</td>
                                <td>{{ toHumanReadable((disksInThisVdev() - 1)
                                        * minDiskSize())
                                }}</td>
                                <td>{{ `${disksInThisVdev() - 1}x read` }}</td>
                                <td>1 disk</td>
                            </tr>
                            <tr v-if="disksInThisVdev() >= 4">
                                <td><input v-on:change="topologyChanged"
                                        v-bind:name="`topology-radio-${props.vdevName}`"
                                        v-bind:id="`raidz2-${props.vdevName}`"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz2</td>
                                <td>{{ toHumanReadable((disksInThisVdev() - 2)
                                        * minDiskSize())
                                }}</td>
                                <td>{{ `${disksInThisVdev() - 2}x read` }}</td>
                                <td>2 disk</td>
                            </tr>
                            <tr v-if="disksInThisVdev() >= 5">
                                <td><input v-on:change="topologyChanged"
                                        v-bind:name="`topology-radio-${props.vdevName}`"
                                        v-bind:id="`raidz3-${props.vdevName}`"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz3</td>
                                <td>{{ toHumanReadable((disksInThisVdev() - 3)
                                        * minDiskSize())
                                }}</td>
                                <td>{{ `${disksInThisVdev() - 3}x read` }}</td>
                                <td>3 disk</td>
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
                            id="topology-selector-next-button" type="button"
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