<script setup>
/**
 * The FinalizeSetup component is the last component in the storage setup
 * carousel. It sends the initialSetup request to the server and reboots the
 * system. While waiting for the system to reboot, it polls the getSetupId
 * request to check if the system has rebooted. When the system has rebooted,
 * the vue management component is shown.
 * @module FinalizeSetup
 */
import { inject } from 'vue'
import { post } from '../shared.mjs'
const appstate = inject('appstate')
const storagepool = inject('storagepool')

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
 * Sends initialSetup request to server for testing
 * 
 * @function testSetup
 * @async
 */
async function testSetup() {
    storagepool.debug = true
    try {
        const xdat = await post('api/initialSetup', {
            accesstoken: appstate.accesstoken,
            storagepool: storagepool
        })
        storagepool.debug = false
    }
    catch (e) {
        const msg = e.message.replace(/^use.*override.*$/m, '<br>')
        document.getElementById('modal-vdev-error-message').innerHTML = msg
        var modalElement = document.getElementById('vdev-configuration-error-modal')
        var modal = bootstrap.Modal.getOrCreateInstance(modalElement)
        modal.show()
        storagepool.debug = false
        throw e
    }
}
/**
 * Sends initialSetup request to server and disables the 
 * install-options-button
 * @async
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
async function configStoragePool(event) {
    const buttonBack = document.getElementById('install-options-button')
    const buttonConfig = document.getElementById('config-button')
    buttonBack.disabled = true
    buttonConfig.disabled = true
    try {
        await testSetup()
    }
    catch (e) {
        buttonBack.disabled = false
        buttonConfig.disabled = false
        return
    }
    storagepool.debug = false
    const msg = document.getElementById('install-msg')
    const progress = document.getElementById('install-progress')
    msg.innerHTML = 'setting up storage pool and persistance'
    console.log('setting up storage pool and persistance')
    const xdat = await post('api/initialSetup', {
        accesstoken: appstate.accesstoken,
        storagepool: storagepool
    })
    console.log(xdat)
    msg.innerHTML = 'rebooting system'
    console.log('rebooting system')
    const ydat = await post('api/rebootSystem',
        { accesstoken: appstate.accesstoken })
    console.log(ydat)
    // while waiting for system to reboot, keep polling getSetupId.
    // counters used to control the flow: 'ticks' is incremented each time 
    // setInterval callback is called, if countTicks if true. and 'tries' is 
    // incremented each time getSetupId is called. this means that with a 
    // setting of ticksBetweenTries=10 and ticksBeforeFirstTry=5, getSetupId 
    // will be called with a 5 second delay, and thereafter every 10 
    // seconds plus the time it takes to execute getSetupId.
    let ticks = 0
    let tries = 0
    let countTicks = true
    const ticksBetweenTries = 10
    const ticksBeforeFirstTry = 5
    // polling getSetupId
    const interval = setInterval(async () => {
        if (ticks == ticksBeforeFirstTry && countTicks) {
            // pause counting ticks
            countTicks = false
            tries++
            try {
                console.log('executing getSetupId')
                const data = await post('api/getSetupId')
                console.log(`finished! setup id: ${data.message}`)
                msg.innerHTML = `finished! setup id: ${data.message}`
                progress.style.width = `100%`
                progress.innerHTML = `100%`
                clearInterval(interval)
                // show vue signIn component
                appstate.vue = 'signIn'
            }
            catch (e) {
                console.log(`getSetupId error: ${e.message}`)
                msg.innerHTML = e.message
            }
            if (tries == 10) {
                // max retries reached
                console.log('max retries reached')
                msg.innerHTML = 'max retries reached'
                progress.style.width = `100%`
                progress.innerHTML = `100%`
                clearInterval(interval)
            }
            progress.style.width = `${tries * 10}%`
            progress.innerHTML = `${tries * 10}%`
            countTicks = true
        }
        // number of ticks to wait before executing getSetupId
        if (ticks == ticksBetweenTries) ticks = 0
        if (countTicks) ticks++
    }, 1000)
}
</script>

<template>
    <div class="carousel-item">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Finalize setup</h4>
                <h6 class="text-muted card-subtitle mb-2">Subtitle</h6>
                <p class="card-text">Depending on your chosen system setup, this may
                    take quite a while, please be patient.
                </p>
                <h6 id="install-msg"></h6>
                <div class="progress" style="height: 24px;margin-top: 20px;margin-bottom: 20px;">
                    <div class="progress-bar" id="install-progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                        style="width: 0%;">0%</div>
                </div>
                <div class="row">
                    <div class="col text-start"><button class="btn btn-primary" id="install-options-button" type="button"
                            v-on:click="goPrev">Prev</button>
                    </div>
                    <div class="col text-end"><button class="btn btn-primary" id="config-button" type="button"
                            v-on:click="configStoragePool">Configure pool</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- modal box -->
        <div class="modal fade" id="vdev-configuration-error-modal" data-bs-backdrop="static" data-bs-keyboard="false"
            tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="vdev-configuration-error-static-backdrop-label">Configuration error</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>hootNAS was unable to configure the storage pool. </p>
                        <p>Go back using the 'Prev' button and please
                            check the following:</p>
                        <p id="modal-vdev-error-message"></p>
                        <p>And then try again.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style></style>