<script setup>
import { inject, onMounted } from 'vue'
const storagepool = inject('storagepool')

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
 * Go to next carouselItem, create a new vdev remove if needed
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 * @todo prevent next, if there are no disks selected here
 */
async function goNext(event) {
    // if encrypt selected, check that password is not 'password' and consists 
    // only of [a-zA-Z0-9_.-] and is min 3 max 30 chars
    if (
        storagepool.encrypt &&
        !storagepool.password.match(
            /^[a-zA-Z0-9_.-]{3,30}(?<!password)$/m)
    ) {
        // if not, focus on input field, then show the tooltip
        const inputField = document.getElementById('password-input')
        inputField.focus()
        const tooltip = bootstrap.Tooltip.getInstance('#password-input')
        tooltip.show()
        // hide toolip after timeout
        setTimeout(() => {
            tooltip.hide()
        }, 2000)
        return
    }
    // advance to next carouselItem
    const carousel = new bootstrap.Carousel(
        document.getElementById('carousel-init'))
    carousel.next()
}
/**
 * Updates the encrypt or compress options for storagepool.
 * @function
 * @listens v-on:change:vdev-name
 * @param {Object} event native DOM event object
 */
function optionChange(event) {
    if (event.target.id === 'compress')
        storagepool.compress = event.target.checked
    if (event.target.id === 'encrypt')
        storagepool.encrypt = event.target.checked
}
/**
 * Updates the password for storagepool.
 * @function
 * @listens v-on:change:vdev-name
 * @param {Object} event native DOM event object
  */
function passwordChange(event) {
    storagepool.password = event.target.value
}
</script>

<template>
    <div class="carousel-item">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Storage options</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Nullam id dolor id nibh ultricies vehicula
                    ut id elit. Cras
                    justo odio, dapibus ac facilisis in, egestas eget quam.
                    Donec id elit non mi
                    porta gravida at eget metus.</p>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Selected</th>
                                <th>Options</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input class="form-check-input"
                                        type="checkbox" name="option-selector"
                                        id="compress"
                                        v-on:change="optionChange"></td>
                                <td data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    data-bs-custom-class="custom-tooltip"
                                    data-bs-title="This will compress your data, increasing the storage capacity, but at a small read/write performance loss">
                                    Compression
                                    <i class="fas fa-info-circle"></i>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><input class="form-check-input"
                                        type="checkbox" name="option-selector"
                                        id="encrypt" v-on:change="optionChange">
                                </td>
                                <td data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    data-bs-custom-class="custom-tooltip"
                                    data-bs-title="This will encrypt your data, but at a small read/write performance loss">
                                    Encryption
                                    <i class="fas fa-info-circle"></i>
                                </td>
                                <td> <input v-on:change="passwordChange"
                                        id="password-input" type="text"
                                        v-bind:value="storagepool.password"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        data-bs-custom-class="custom-tooltip"
                                        data-bs-title="The passphrase must be 3-30 characters long, consisting of a-z A-Z 0-9 _.- "
                                        data-bs-container="body" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row">
                    <div class="col text-start">
                        <button class="btn btn-primary"
                            id="options-selector-prev-button" type="button"
                            v-on:click="goPrev">Prev</button>
                    </div>
                    <div class="col text-end">
                        <button class="btn btn-primary"
                            id="options-selector-next-button" type="button"
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