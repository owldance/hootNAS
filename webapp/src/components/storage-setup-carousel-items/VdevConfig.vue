<script setup>
/**
 * The VdevConfig component is used to configure vdevs in the storagepool.
 * Since there can be multiple vdevs there can be multiple insctances of this 
 * VdevConfig component, therefore the vdevType property, which is unique, is 
 * prepended to most html element id's and names in this component.
 * @module components/storage-setup-carousel-items/VdevConfig
 * @todo add support for selecting hot spares for draid vdevs
 */
import { inject, nextTick, onMounted } from 'vue'
const storagepool = inject('storagepool')
const allDisks = inject('allDisks')
/** @typedef {import('../../../../services/blockdevices/getBlockDevices.mjs').BlockDevice} BlockDevice */
/** @returns {Array<BlockDevice>} */
function filteredDevices() {
    return allDisks.filter((disk) => {
        return disk.type === 'disk'
    })
}
/**
 * The properties passed to this component in the StorageSetupCarousel component
 * @typedef {Object} Props
 * @property {String} vdevType the type of the vdev
 */
/** @type {Props} */
const props = defineProps({ vdevType: String })
/** @type {Number} vdev index from type specified in props */
const thisVdevIndex = storagepool.vdevs.findIndex(({ type }) =>
    type === props.vdevType)
/**
 * @typedef {Object} VdevRedundancies
 * @property {Array<String>} data valid data vdev redundancies
 * @property {Array<String>} log valid log vdev redundancies
 * @property {Array<String>} cache valid cache vdev redundancies
 * @property {Array<String>} special valid special vdev redundancies
 * @property {Array<String>} spare valid spare vdev redundancies
 * @property {Array<String>} dedup valid dedup vdev redundancies
 */
 
/** @type {VdevRedundancies} supported vdev redundancies */
const vdevRedundancies = {
    data: ['stripe', 'mirror', 'raidz1', 'raidz2', 'raidz3',
        'draid1', 'draid2', 'draid3'],
    log: ['stripe', 'mirror'],
    cache: ['stripe'],
    special: ['stripe', 'mirror'], // number of redundant disks must be equal to number of redundant disks in data vdevs
    spare: ['stripe'],
    dedup: ['stripe', 'mirror'] // number of redundant disks must be equal to number of redundant disks in data vdevs
}
// @todo implement special/dedup rules for data vdevs

class Redundancy {
    constructor(name, requiredNumberOfDisks, redundantDisks) {
        this.name = name
        this.requiredNumberOfDisks = requiredNumberOfDisks
        this.redundantDisks = redundantDisks
    }
    /**
     * Determines if this redundancy configuration can be used for the current Vdev.
     * @returns {boolean} True if this redundancy configuration can be used.
     */
    render() {
        // stip props.vdevType of anything from and including the 
        // first hyphen to the end, as there can be more than one data vdev
        const vdevType = props.vdevType.replace(/-.*/, '')
        if (
            ((numberOfDisksInThisVdev() >= this.requiredNumberOfDisks)
                && vdevRedundancies[vdevType].includes(this.name))
        )
            return true
        return false
    }
    /**
     * Calculates the capacity of this redundancy configuration.
     * @returns {string} The capacity of this redundancy configuration in human-readable format.
     */
    capacity() {
        if (this.name.match('draid')) {
            if (getSelectedRedundancy() == this.name) {
                return toHumanReadable(
                    (numberOfDisksInThisVdev() - getNumberOfDspares()
                        - this.redundantDisks) * minDiskSize()
                )
            } else {
                // all draids that are not selected
                return toHumanReadable(
                    (numberOfDisksInThisVdev() - this.redundantDisks)
                    * minDiskSize()
                )
            }
        } else if (this.name.match('raidz')) {
            return toHumanReadable(
                (numberOfDisksInThisVdev() - this.redundantDisks)
                * minDiskSize()
            )
        } else if (this.name.match('mirror')) {
            return toHumanReadable(minDiskSize())
        }
    }
    /**
     * Calculates the read gain of the Vdev configuration based on the number of disks and redundancy.
     * @returns {string} The read gain in the format "${gain}x read".
     */
    gain() {
        if (this.name.match('draid')) {
            if (getSelectedRedundancy() == this.name) {
                return `${numberOfDisksInThisVdev() - getNumberOfDspares()
                    - this.redundantDisks}x read`
            } else {
                return `${numberOfDisksInThisVdev()
                    - this.redundantDisks}x read`
            }
        } else {
            return `${numberOfDisksInThisVdev() - this.redundantDisks}x read`
        }
    }
    // draid specific
    renderDsparesSelect() {
        if (
            getSelectedRedundancy().match(this.name) &&
            (numberOfDisksInThisVdev() - this.requiredNumberOfDisks > 0)
        )
            return true
        return false
    }
    // draid specific
    renderBottomBorder() {
        if (
            getSelectedRedundancy().match(this.name) &&
            (numberOfDisksInThisVdev() - this.requiredNumberOfDisks > 0)
        )
            return {
                'border-bottom': 'transparent'
            }
    }
    // draid specific
    numberOfDsparesPossible() {
        return numberOfDisksInThisVdev() - this.requiredNumberOfDisks
    }
}
const mirror = new Redundancy('mirror', 2, 1)
const draid1 = new Redundancy('draid1', 3, 1)
const draid2 = new Redundancy('draid2', 4, 2)
const draid3 = new Redundancy('draid3', 5, 3)
const raidz1 = new Redundancy('raidz1', 3, 1)
const raidz2 = new Redundancy('raidz2', 4, 2)
const raidz3 = new Redundancy('raidz3', 5, 3)

/** @type {Object} Carousel bootstrap carousel object */
const carousel = new bootstrap.Carousel(
    document.getElementById('carousel-init'))
// event driven functions
/**
 * This vue lifecycle function is used by css driven bootstrap components that 
 * require access to the fully rendedred DOM before they can be initialized.
 * @function  onMounted
 * @async
 */
onMounted(() => {
    // initialize tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    // event listener for dropdown button
    var buttonDropdown = document.getElementById(
        `action-dropdown-button-${props.vdevType}`)
    buttonDropdown.addEventListener('hide.bs.dropdown', (event) => {
        // check if we are adding a vdev
        if (event.clickEvent.originalTarget.id.match('vdev-add')) {
            let newVdevType = ''
            // is it a data vdev?
            if (event.clickEvent.originalTarget.id.match('data-vdev-add')) {
                // get number of vdevs in storagepool 
                // with type starting with data-
                const numberOfDataVdevs = storagepool.vdevs.filter(
                    ({ type }) => type.startsWith('data-')).length
                newVdevType = `data-${numberOfDataVdevs + 1}`
                // add new data vdev to storagepool
                storagepool.vdevs.push({
                    blockdevices: [],
                    redundancy: 'stripe',
                    type: newVdevType,
                    delete: false,
                    dspares: 0
                })
            } else {
                // it's not a data vdev
                // grab the type of the vdev we are adding from the id
                newVdevType = event.clickEvent.originalTarget
                    .id.match(/^[^-]+/)[0]
                // add new vdev to storagepool
                storagepool.vdevs.push({
                    blockdevices: [],
                    redundancy: 'stripe',
                    type: newVdevType,
                    delete: false,
                    dspares: 0
                })
            }
            // wait for DOM update
            nextTick(() => {
                // the new vdev is the second to last carouselItem
                const numberOfCarouselItems = document.querySelector(
                    '.carousel-inner').childElementCount
                // to method is zero based
                carousel.to(numberOfCarouselItems - 2)
            })
        }
    })
})
/**
 * Add/remove disk to/from this vdev 
 * @function
 * @listens v-on:change:checked
 * @param {Object} event native DOM event object
 */
function diskSelectionChanged(event) {
    if (event.target.checked) {
        // copy disk to this vdev
        storagepool.vdevs[thisVdevIndex].devices.push(
            allDisks.find(({ kname }) =>
                kname === event.target.id)
        )
    } else {
        // remove disk from this vdev
        storagepool.vdevs[thisVdevIndex].devices.splice(
            storagepool.vdevs[thisVdevIndex].devices.findIndex(
                ({ kname }) => kname === event.target.id), 1)
        // count dspares down
        if (storagepool.vdevs[thisVdevIndex].dspares > 0) {
            storagepool.vdevs[thisVdevIndex].dspares--
        }

    }
}
/**
 * Updates the redundancy for this vdev in storagepool.
 * @function
 * @listens v-on:change:redundancy-radio
 * @param {Object} event native DOM event object
 */
function redundancyChanged(event) {
    // extract redundancy from id
    const redundancy = event.target.id.match(/[^-]*/m)[0]
    storagepool.vdevs[thisVdevIndex].redundancy = redundancy
    // reset dspares
    storagepool.vdevs[thisVdevIndex].dspares = 0
}
/**
 * Updates the number of draid spares for this vdev in storagepool.
 * @function
 * @listens v-on:change:spares
 * @param {Object} event native DOM event object
 */
function draidSparesChanged(event) {
    storagepool.vdevs[thisVdevIndex].dspares = event.target.value
}
// computed properties
/**
 * Returns the types of vdevs of a given type in storagepool, except types 
 * starting with 'data' because more than one data vdev is allowed.
 * @function vdevsNotInStoragepool
 * @returns {Array} array of vdev types
 */
function vdevsNotInStoragepool() {
    // get vdev types in storagepool, except vdev types starting with 'data'
    // because more than one data vdev is allowed
    const vdevsInStoragepool = storagepool.vdevs.map(({ type }) => type)
        .filter(vdevType => !vdevType.startsWith('data'))
    // get vdev types not in storagepool
    const vdevsNotInStoragepool = Object.keys(vdevRedundancies).filter(
        vdevType => !vdevsInStoragepool.includes(vdevType))
    return vdevsNotInStoragepool

}
/**
* Converts a number into a human readable string.
* @function
* @param {Number} bytes 
* @returns {String} On resolve
*/
function toHumanReadable(bytes) {
    if (bytes === 0) return '0 bytes'
    var s = ['bytes', 'k', 'M', 'G', 'T', 'P']
    var e = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, e)).toFixed(2) + s[e]
}
/**
 * count the number of disks is in this vdev
 * @function numberOfDisksInThisVdev
 * @returns {Number} number of disks in this vdev
 */
function numberOfDisksInThisVdev() {
    return storagepool.vdevs[thisVdevIndex].devices.length
}
/**
 * Returns the smallest size disk in Kb of all disks in this vdev
 * @function
 * @returns {Number} the smallest size disk in Kb 
 */
function minDiskSize() {
    // make array of sizes
    const sizes = storagepool.vdevs[thisVdevIndex].devices.map(o => o.size)
    // find min 
    return Math.min(...sizes)
}
/** @returns {Number} compund size of all disks in this vdev in Kb */
function compoundCapacity() {
    return storagepool.vdevs[thisVdevIndex].devices.reduce(
        (accumulator, currentValue) => accumulator + currentValue.size, 0)
}
/**
 * check if disk kname is in this vdev
 * @param {String} diskKname kernel name of the disk
 * @returns {Boolean} true if disk is in any vdev in storagepool
 */
function diskInThisVdev(diskKname) {
    const ret = storagepool.vdevs[thisVdevIndex].devices.find(({ kname }) =>
        kname === diskKname)
    return ret ? true : false
}
/**
 * check if disk is in any vdev in storagepool
 * @function diskInAnyVdev
 * @param {String} diskKname kernel name of the disk
 * @returns {Boolean} true if disk is in any vdev in storagepool
 */
function diskInAnyVdev(diskKname) {
    const ret = storagepool.vdevs.find(
        vdev => vdev.devices.find(({ kname }) =>
            kname === diskKname))
    return ret ? true : false
}
function getNumberOfDspares() {
    return storagepool.vdevs[thisVdevIndex].dspares
}
function getSelectedRedundancy() {
    return storagepool.vdevs[thisVdevIndex].redundancy
}
// button functions
function okRemoveEmptyVdev(event) {
    // mark this vdev for deletion, it's done this way because thisVdevIndex
    // may become out of scope when 'slid.bs.carousel' event handler is called
    storagepool.vdevs[thisVdevIndex].delete = true
    // return a bootstrap modal instance
    var modalElement = document.getElementById(
        `vdev-empty-modal-${props.vdevType}`)
    var modal = bootstrap.Modal.getInstance(modalElement)
    modal.hide()
    // add event listener to carousel to remove this vdev from storagepool when 
    // the carousel has finished sliding, otherwise the transition looks jerky
    const myCarousel = document.getElementById('carousel-init')
    myCarousel.addEventListener('slid.bs.carousel', event => {
        // remove vdevs marked for deletion
        storagepool.vdevs = storagepool.vdevs.filter(
            ({ delete: del }) => !del)
    })
    // actually goes to previous carouselItem, because all vdev carouselItems
    // are between the first and last carouselItem
    carousel.to(thisVdevIndex)
}
/**
 * Go to previous carouselItem, if there are no disks selected here, remove 
 * this vdev from storagepool
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
function goPrev(event) {
    // if there are no disks selected in this vdev, show modal
    if (!storagepool.vdevs[thisVdevIndex].devices.length) {
        var modalElement = document.getElementById(`vdev-empty-modal-${props.vdevType}`)
        var modal = bootstrap.Modal.getOrCreateInstance(modalElement)
        modal.show()
        return
    } else {
        carousel.prev()
    }
}
/**
 * Go to next carouselItem
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
function goNext(event) {
    // if there are no disks selected in this vdev, show modal
    if (!storagepool.vdevs[thisVdevIndex].devices.length) {
        var modalElement = document.getElementById(`vdev-empty-modal-${props.vdevType}`)
        var modal = bootstrap.Modal.getOrCreateInstance(modalElement)
        modal.show()
        return
    } else {
        carousel.next()
    }
}

</script>
<template>
    <div class="carousel-item" v-bind:id="props.vdevType">
        <div class="card">
            <div class="card-body">
                <template v-if="props.vdevType.startsWith('data-')">
                    <h4 class="card-title">Create a DATA vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">You need at least one DATA vdev</h5>
                    <p class="card-text">This is where all your data is stored. If you create more than one
                        DATA vdev, then read/writes will be load-balanced between those vdevs.
                    </p>
                </template>
                <template v-if="props.vdevType.startsWith('spare')">
                    <h4 class="card-title">Create a HOT SPARE vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">This is optional, but recommended</h5>
                    <p class="card-text">A HOT SPARE vdev keeps track of available hot spares for a pool. ZFS
                        allows disks to be associated with the storagepool as "hot spares". These disks are
                        not actively used in the storagepool, but when an active disk fails, it is
                        automatically replaced by a hot spare from this vdev.
                    </p>
                    <p class="card-text">Note: Distributed raidz's i.e. draid1, draid2 and draid3, can not draw
                        spares from the this vdev, instead add more disks to vdevs with draid1, draid2 and draid3
                        redundancy, and select them as spares in that vdev."
                    </p>
                </template>
                <template v-if="props.vdevType.startsWith('log')">
                    <h4 class="card-title">Create a LOG vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">This is optional, but recommended</h5>
                    <p class="card-text">A separate log device for the ZFS Intent Log (ZIL). By default, the intent
                        log is allocated from blocks within the storagepool. However, it might be
                        possible to get better performance using a LOG vedv, especially with disks such as NVRAM.
                    </p>
                </template>
                <template v-if="props.vdevType.startsWith('special')">
                    <h4 class="card-title">Create a SPECIAL vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">This is optional</h5>
                    <p class="card-text">A dedicated vdev for allocating various kinds of internal metadata,
                        and optionally small file blocks. The redundancy of this vdev should match
                        the redundancy of the other DATA vdevs in the storagepool.
                    </p>
                </template>
                <template v-if="props.vdevType.startsWith('cache')">
                    <h4 class="card-title">Create a CACHE vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">This is optional, but recommended</h5>
                    <p class="card-text">A vdev used to cache storagepool data. This vdev provide an additional
                        layer of caching between main memory and disk. Using a cache vdev provides the
                        greatest performance improvement for random read-workloads of mostly static
                        content.
                    </p>
                </template>
                <template v-if="props.vdevType.startsWith('dedup')">
                    <h4 class="card-title">Create a DEDUP vdev</h4>
                    <h5 class="card-subtitle mb-2 text-body-secondary">This is optional</h5>
                    <p class="card-text">A vdev dedicated solely for deduplication tables. The redundancy of this
                        vdev should match the redundancy of the other DATA vedev in the storagepool.
                    </p>
                </template>
                <!-- disk seltor -->
                <h5 class="card-subtitle">Disks</h5>
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
                            <tr v-for="disk in filteredDevices()">
                                <td class="text-center">
                                    <input v-if="diskInThisVdev(disk.kname)" v-on:change="diskSelectionChanged"
                                        class="form-check-input" type="checkbox" name="disk-selector" v-bind:id="disk.kname"
                                        checked>
                                    <input v-else-if="diskInAnyVdev(disk.kname)" v-on:change="diskSelectionChanged"
                                        class="form-check-input" type="checkbox" name="disk-selector" v-bind:id="disk.kname"
                                        checked disabled>
                                    <input v-else class="form-check-input" type="checkbox" name="disk-selector"
                                        v-bind:id="disk.kname" v-on:change="diskSelectionChanged">
                                </td>
                                <td>{{ disk.kname }}</td>
                                <td>{{ toHumanReadable(disk.size) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- redundancy selector -->
                <template v-if="numberOfDisksInThisVdev() >= 1">
                    <h5 class="card-subtitle">Redundancy</h5>
                    <div class="table-responsive">
                        <table class="table">
                            <!-- header -->
                            <thead>
                                <tr>
                                    <th>Selected</th>
                                    <th>Redundancy</th>
                                    <th>Capacity</th>
                                    <th data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Speed gain compared to a single disk" data-bs-custom-class="custom-tooltip">
                                        Speed gain<i class="fas fa-info-circle"></i>
                                    </th>
                                    <th data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Number of disks that can fail without causing any data loss"
                                        data-bs-custom-class="custom-tooltip">
                                        Fault tolerance<i class="fas fa-info-circle"></i></th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- stripe, this is default for all vdevs -->
                                <tr>
                                    <td><input v-on:change="redundancyChanged"
                                            v-bind:name="`redundancy-radio-${props.vdevType}`"
                                            v-bind:id="`stripe-${props.vdevType}`" class="form-check-input" type="radio"
                                            checked>
                                    </td>
                                    <td>stripe</td>
                                    <td>{{ toHumanReadable(compoundCapacity()) }}</td>
                                    <td>{{ `${numberOfDisksInThisVdev()}x read/write` }}
                                    </td>
                                    <td>none</td>
                                </tr>
                                <!-- mirror -->
                                <tr v-if="mirror.render()">
                                    <td><input v-on:change="redundancyChanged"
                                            v-bind:name="`redundancy-radio-${props.vdevType}`"
                                            v-bind:id="`mirror-${props.vdevType}`" class="form-check-input" type="radio">
                                    </td>
                                    <td>mirror</td>
                                    <td>{{ mirror.capacity() }}</td>
                                    <td>{{ mirror.gain() }}</td>
                                    <!-- disk/disks singular/plural logic -->
                                    <td v-if="numberOfDisksInThisVdev() === 2">
                                        1 disk</td>
                                    <td v-else>
                                        {{ `${numberOfDisksInThisVdev() - 1} disks` }}</td>
                                </tr>
                                <!-- raidz1 -->
                                <tr v-if="raidz1.render()">
                                    <td><input v-on:change="redundancyChanged"
                                            v-bind:name="`redundancy-radio-${props.vdevType}`"
                                            v-bind:id="`raidz1-${props.vdevType}`" class="form-check-input" type="radio">
                                    </td>
                                    <td>raidz1</td>
                                    <td>{{ raidz1.capacity() }}</td>
                                    <td>{{ raidz1.gain() }}</td>
                                    <td>1 disk</td>
                                </tr>
                                <!-- draid1 -->
                                <template v-if="draid1.render()">
                                    <!-- if redundancy is selected and the required number of disks in vdev are present, 
                                        then the next row here below will be rendered too, to avoid user confusion there 
                                        should not be an visual separation between those two rows, therefore we remove 
                                        the bottom border from the first row -->
                                    <tr v-bind:style="draid1.renderBottomBorder()">
                                        <td><input v-on:change="redundancyChanged"
                                                v-bind:name="`redundancy-radio-${props.vdevType}`"
                                                v-bind:id="`draid1-${props.vdevType}`" class="form-check-input"
                                                type="radio">
                                        </td>
                                        <td>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top"
                                                title="A distributed raidz1 for faster resilvering and better performance, however any spare disks must be present in this vdev. draid1 can not draw spares from the traditional SPARE vdev, instead add more disks to this vdev."
                                                data-bs-custom-class="custom-tooltip">draid1
                                                <i class="fas fa-info-circle">&nbsp</i>
                                            </span>
                                        </td>
                                        <td>{{ draid1.capacity() }}</td>
                                        <td>{{ draid1.gain() }}</td>
                                        <td>1 disk</td>
                                    </tr>
                                    <!-- if redundancy is selected and the required number of disks are selected, then 
                                        show form-range to select number of spares -->
                                    <template v-if="draid1.renderDsparesSelect()">
                                        <tr style="border-bottom:transparent">
                                            <td colspan="5" class="text-left">
                                                <p> disks available for spares: {{ draid1.numberOfDsparesPossible() }}, you
                                                    have selected {{ getNumberOfDspares() }}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <input type="range" class="form-range" min="0"
                                                    v-bind:max="`${draid1.numberOfDsparesPossible()}`"
                                                    v-bind:id="`draid1-spares-${props.vdevType}`"
                                                    v-on:input="draidSparesChanged" value="0">
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                                <!-- raidz2 -->
                                <tr v-if="raidz2.render()">
                                    <td><input v-on:change="redundancyChanged"
                                            v-bind:name="`redundancy-radio-${props.vdevType}`"
                                            v-bind:id="`raidz2-${props.vdevType}`" class="form-check-input" type="radio">
                                    </td>
                                    <td>raidz2</td>
                                    <td>{{ raidz2.capacity() }}</td>
                                    <td>{{ raidz2.gain() }}</td>
                                    <td>2 disk</td>
                                </tr>
                                <!-- draid2 -->
                                <template v-if="draid2.render()">
                                    <!-- if redundancy is selected and the required number of disks in vdev are present, 
                                        then the next row here below will be rendered too, to avoid user confusion there 
                                        should not be an visual separation between those two rows, therefore we remove 
                                        the bottom border from the first row -->
                                    <tr v-bind:style="draid2.renderBottomBorder()">
                                        <td><input v-on:change="redundancyChanged"
                                                v-bind:name="`redundancy-radio-${props.vdevType}`"
                                                v-bind:id="`draid2-${props.vdevType}`" class="form-check-input"
                                                type="radio">
                                        </td>
                                        <td>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top"
                                                title="A distributed raidz2 for faster resilvering and better performance, however any spare disks must be present in this vdev. draid2 can not draw spares from the traditional SPARE vdev, instead add more disks to this vdev."
                                                data-bs-custom-class="custom-tooltip">draid2
                                                <i class="fas fa-info-circle">&nbsp</i>
                                            </span>
                                        </td>
                                        <td>{{ draid2.capacity() }}</td>
                                        <td>{{ draid2.gain() }}</td>
                                        <td>2 disk</td>
                                    </tr>
                                    <!-- if redundancy is selected and the required number of disks are selected, then 
                                        show form-range to select number of spares -->
                                    <template v-if="draid2.renderDsparesSelect()">
                                        <tr style="border-bottom:transparent">
                                            <td colspan="5" class="text-left">
                                                <p> disks available for spares: {{ draid2.numberOfDsparesPossible() }}, you
                                                    have selected {{ getNumberOfDspares() }}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <input type="range" class="form-range" min="0"
                                                    v-bind:max="`${draid2.numberOfDsparesPossible()}`"
                                                    v-bind:id="`draid2-spares-${props.vdevType}`"
                                                    v-on:input="draidSparesChanged" value="0">
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                                <!-- raidz3 -->
                                <tr v-if="raidz3.render()">
                                    <td><input v-on:change="redundancyChanged"
                                            v-bind:name="`redundancy-radio-${props.vdevType}`"
                                            v-bind:id="`raidz3-${props.vdevType}`" class="form-check-input" type="radio">
                                    </td>
                                    <td>raidz3</td>
                                    <td>{{ raidz3.capacity() }}</td>
                                    <td>{{ raidz3.gain() }}</td>
                                    <td>3 disk</td>
                                </tr>
                                <!-- draid3 -->
                                <template v-if="draid3.render()">
                                    <!-- if redundancy is selected and the required number of disks in vdev are present, 
                                        then the next row here below will be rendered too, to avoid user confusion there 
                                        should not be an visual separation between those two rows, therefore we remove 
                                        the bottom border from the first row -->
                                    <tr v-bind:style="draid3.renderBottomBorder()">
                                        <td><input v-on:change="redundancyChanged"
                                                v-bind:name="`redundancy-radio-${props.vdevType}`"
                                                v-bind:id="`draid3-${props.vdevType}`" class="form-check-input"
                                                type="radio">
                                        </td>
                                        <td>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top"
                                                title="A distributed raidz3 for faster resilvering and better performance, however any spare disks must be present in this vdev. draid3 can not draw spares from the traditional SPARE vdev, instead add more disks to this vdev."
                                                data-bs-custom-class="custom-tooltip">draid3
                                                <i class="fas fa-info-circle">&nbsp</i>
                                            </span>
                                        </td>
                                        <td>{{ draid3.capacity() }}</td>
                                        <td>{{ draid3.gain() }}</td>
                                        <td>3 disk</td>
                                    </tr>
                                    <!-- if redundancy is selected and the required number of disks are selected, then 
                                        show form-range to select number of spares -->
                                    <template v-if="draid3.renderDsparesSelect()">
                                        <tr style="border-bottom:transparent">
                                            <td colspan="5" class="text-left">
                                                <p> disks available for spares: {{ draid3.numberOfDsparesPossible() }}, you
                                                    have selected {{ getNumberOfDspares() }}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <input type="range" class="form-range" min="0"
                                                    v-bind:max="`${draid3.numberOfDsparesPossible()}`"
                                                    v-bind:id="`draid3-spares-${props.vdevType}`"
                                                    v-on:input="draidSparesChanged" value="0">
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </template>
                <!-- next/prev/add buttons -->
                <div class="row">
                    <div class="col text-start">
                        <button class="btn btn-primary" id="disk-selector-prev-button" type="button"
                            v-on:click="goPrev">Prev</button>
                    </div>
                    <div class="col text-end">
                        <!-- split button -->
                        <div class="btn-group">
                            <button type="button" class="btn btn-primary"
                                v-bind:id="`disk-selector-next-button-${props.vdevType}`" v-on:click="goNext">Next</button>
                            <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                                v-bind:id="`action-dropdown-button-${props.vdevType}`" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu">
                                <span v-for="availableVdevType in vdevsNotInStoragepool()">
                                    <li class="dropdown-item pointer"
                                        v-bind:id="`${availableVdevType}-vdev-add-${props.vdevType}`">
                                        {{ `Add ${availableVdevType.toUpperCase()} vdev` }}</li>
                                </span>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- modal box -->
        <div class="modal fade" v-bind:id="`vdev-empty-modal-${props.vdevType}`" data-bs-backdrop="static"
            data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">This vdev is empty</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        You didn't select any disks for this vdev. If you continue, this vdev will be removed from the
                        storagepool. You can allways add it back later.
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="ok-remove-button"
                            v-on:click="okRemoveEmptyVdev">Continue</button>
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

/* pointer cursor for dropdown items */
li.pointer {
    cursor: pointer;
}
</style>