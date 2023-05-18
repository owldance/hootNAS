<script setup>
import { toHumanReadable } from './shared.mjs'
import { inject, onMounted } from 'vue'
const storagepool = inject('storagepool')

/**
 * Sets up eventlisteners for all tooltips and popovers in DOM
 * @function
 * @listens onMounted fires after the component has been mounted
 */
onMounted(() => {
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})
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
    if (!storagepool.topology) {
        const tooltip = bootstrap.Tooltip
            .getInstance('#select-topology-tooltip')
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
 * Returns the smallest vdev size in Kb of all vdevs less 'reserved' 
 * and 'devicepool'
 * @function
 * @returns {Number} the smallest vdev disk in Kb 
 */
function minVdevCapacity() {
    // make array of sizes
    const sizes = storagepool.vdevs.map(o => o.capacity)
    // do not include zero values from 'reserved' 
    // and 'devicepool' in calculation
    const noZeros = sizes.filter(e => e != 0)
    // find min 
    return Math.min(...noZeros)
}
/**
 * Updates the topology for storagepool.
 * @function
 * @listens v-on:change:topology-radio
 * @param {Object} event native DOM event object
 */
function topologyChanged(event) {
    switch (event.target.id) {
        case 'stripe':
            storagepool.capacity = vdevsInStoragepool()
                * minVdevCapacity()
            break
        case 'mirror':
            storagepool.capacity = minVdevCapacity()
            break
        case 'raidz1':
            storagepool.capacity = (vdevsInStoragepool() - 1)
                * minVdevCapacity()
            break
        case 'raidz2':
            storagepool.capacity = (vdevsInStoragepool() - 2)
                * minVdevCapacity()
            break
        case 'raidz3':
            storagepool.capacity = (vdevsInStoragepool() - 3)
                * minVdevCapacity()
            break
    }
    storagepool.topology = event.target.id

}
/**
 * Returns the number of usable vdevs in storagepool i.e. all vdevs less 'devicepool'
 * and 'reserved'
 * @function
 * @returns {Number} the number of disks in this vdev
 */
function vdevsInStoragepool() {
    return storagepool.vdevs.length - 2
}
</script>

<template>
    <div class="carousel-item">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Storage pool topology</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Nullam id dolor id nibh ultricies vehicula
                    ut id elit. Cras justo odio, dapibus ac facilisis in,
                    egestas eget quam. Donec id elit non mi porta gravida at
                    eget metus.</p>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th id="select-topology-tooltip"
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
                            <tr v-if="vdevsInStoragepool() >= 2">
                                <td> <input v-on:change="topologyChanged"
                                        name="topology-radio" id="stripe"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>stripe</td>
                                <td>{{ toHumanReadable(vdevsInStoragepool()
                                        * minVdevCapacity())
                                }}</td>
                                <td>{{ `${vdevsInStoragepool()}x read/write` }}
                                </td>
                                <td>none</td>
                            </tr>
                            <tr v-if="vdevsInStoragepool() >= 2">
                                <td><input v-on:change="topologyChanged"
                                        name="topology-radio" id="mirror"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>mirror</td>
                                <td>{{ toHumanReadable(minVdevCapacity()) }}
                                </td>
                                <td>{{ `${vdevsInStoragepool()}x read` }}</td>
                                <td v-if="vdevsInStoragepool() === 2">
                                    1 disk</td>
                                <td v-else>
                                    {{ `${vdevsInStoragepool() - 1} disks` }}
                                </td>
                            </tr>
                            <tr v-if="vdevsInStoragepool() >= 3">
                                <td><input v-on:change="topologyChanged"
                                        name="topology-radio" id="raidz1"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz1</td>
                                <td>{{ toHumanReadable((vdevsInStoragepool() -
                                        1) * minVdevCapacity())
                                }}</td>
                                <td>{{ `${vdevsInStoragepool() - 1}x read` }}
                                </td>
                                <td>1 disk</td>
                            </tr>
                            <tr v-if="vdevsInStoragepool() >= 4">
                                <td><input v-on:change="topologyChanged"
                                        name="topology-radio" id="raidz2"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz2</td>
                                <td>{{ toHumanReadable((vdevsInStoragepool() -
                                        2) * minVdevCapacity())
                                }}</td>
                                <td>{{ `${vdevsInStoragepool() - 2}x read` }}
                                </td>
                                <td>2 disk</td>
                            </tr>
                            <tr v-if="vdevsInStoragepool() >= 5">
                                <td><input v-on:change="topologyChanged"
                                        name="topology-radio" id="raidz3"
                                        class="form-check-input" type="radio">
                                </td>
                                <td>raidz3</td>
                                <td>{{ toHumanReadable((vdevsInStoragepool() -
                                        3) * minVdevCapacity())
                                }}</td>
                                <td>{{ `${vdevsInStoragepool() - 3}x read` }}
                                </td>
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