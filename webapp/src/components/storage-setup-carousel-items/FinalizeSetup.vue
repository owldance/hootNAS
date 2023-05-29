<script setup>
import { inject } from 'vue'
import { post, get } from './shared.mjs'
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
 * Sends initialSetup request to server for testing and disables the 
 * install-options-button
 * @async
 * @function
 * @listens v-on:change:click
 * @param {Object} event native DOM event object
 */
 async function testSetup(event) {
    storagepool.debug = true
    console.log(storagepool)
    const xdat = await post('initialSetup', storagepool)
    console.log(xdat.message)
    storagepool.debug = false
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
    storagepool.debug = false
    const buttonBack = document.getElementById('install-options-button')
    buttonBack.disabled = true
    const buttonConfig = document.getElementById('config-button')
    buttonConfig.disabled = true
    const msg = document.getElementById('install-msg')
    const progress = document.getElementById('install-progress')
    msg.innerHTML = 'setting up storage pool and perstance'
    console.log('setting up storage pool and perstance')
    const xdat = await post('initialSetup', storagepool)
    console.log(xdat)
    msg.innerHTML = 'rebooting system'
    console.log('rebooting system')
    const ydat = await get('rebootSystem')
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
                const data = await get('getSetupId')
                console.log(`finished! setup id: ${data.message}`)
                msg.innerHTML = `finished! setup id: ${data.message}`
                progress.style.width = `100%`
                progress.innerHTML = `100%`
                // show vue management component
                appstate.vue = 'management'
                clearInterval(interval)
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
                <p class="card-text">Depending on your system and internet
                    connection, this may
                    take quite a while, please be patient.
                </p>
                <p class="card-text">Test your setup without actually
                    modifying anything on the hootnas. The results will be
                    displayed in the browser console, press F12 to view.
                </p>
                <div class="col text-start"><button class="btn btn-warning" id="test-setup-button" type="button"
                            v-on:click="testSetup">Test Setup</button>
                    </div>
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
    </div>
</template> 

<style></style>