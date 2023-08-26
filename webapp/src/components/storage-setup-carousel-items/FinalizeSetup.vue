<script setup>
/**
 * The FinalizeSetup component is the last component in the storage setup
 * carousel. It sends the initialSetup request to the server and reboots the
 * system. While waiting for the system to reboot, it polls the 
 * isPersistenceActive request to check if the system has rebooted. When the 
 * system has rebooted, the vue management component is shown.
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
 * Displays a modal with the given title and body content, and an optional 
 * disabled button.
 * @param {string} title - The title of the modal.
 * @param {string} body - The body content of the modal.
 * @param {boolean} [buttonDisabled=false] - Whether or not the button in the 
 * modal should be disabled.
 */
function showFinalizeModal(title, body, buttonDisabled = false) {
    document.getElementById('finalize-modal-title').innerHTML = title
    document.getElementById('finalize-modal-body').innerHTML = body
    const cancelButton = document.getElementById('finalize-modal-button')
    if (buttonDisabled)
        cancelButton.disabled = true
    else
        cancelButton.disabled = false
    var modalElement = document.getElementById('finalize-modal')
    var modal = bootstrap.Modal.getOrCreateInstance(modalElement)
    modal.show()
}

function progressProgressBar(progressBarProgressed, progressBarSlices) {
    progressBarProgressed++
    const progressBarSlice = 100/progressBarSlices
    const progressBarProgress = Math.ceil(progressBarProgressed * progressBarSlice)
    const progress = document.getElementById('install-progress')
    progress.style.width = `${progressBarProgress}%`
    progress.innerHTML = `${progressBarProgress}%`
    return progressBarProgressed
}

function isProductionMode() {
  if (location.port === '80' || location.port === '') 
    return true
  else 
    return false
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
    const showMessage = document.getElementById('install-msg')
    const showMaxRetriesMessage = document.getElementById('install-max-msg')
    buttonBack.disabled = true
    buttonConfig.disabled = true
    // number of slices/steps in the progress bar to reach 100%
    const progressBarSlices = 12
    let progressBarProgressed = 0
    // test the submitted setup first
    try {
        storagepool.debug = true
        showMessage.innerHTML = 'checking configuration...'
        await post('api/initialSetup', {
            accesstoken: appstate.accesstoken,
            storagepool: storagepool
        })
        progressBarProgressed=
            progressProgressBar(progressBarProgressed, progressBarSlices)
    }
    catch (e) {
        // test failed, allow user to go back and try again
        const showMessage = e.message.replace(/^use.*override.*$/m, '<br>')
        showFinalizeModal('Configuration Error',
            `<p>hootNAS was unable to configure the storage pool. </p>
        <p>Go back using the 'Prev' button and please check the following:</p>
        <p>${showMessage}</p><p>And then try again.</p>`, false)
        buttonBack.disabled = false
        buttonConfig.disabled = false
        return
    }
    // now setup storage pool for real
    storagepool.debug = false
    showMessage.innerHTML = 'Committing your configuration to disk...'
    await post('api/initialSetup', {
        accesstoken: appstate.accesstoken,
        storagepool: storagepool
    })
    progressBarProgressed=
        progressProgressBar(progressBarProgressed, progressBarSlices)
    // reboot the system
    showMessage.innerHTML = 'Rebooting system...'
    progressBarProgressed=
        progressProgressBar(progressBarProgressed, progressBarSlices)
    try {
        await post('api/rebootSystem',
            { accesstoken: appstate.accesstoken })
    }
    catch (e) {
        // show error message, if it's not a network error. network errors are
        // expected, because the system is rebooting.
        if (!e.message.match(/ssh|verification|network/i)) {
            showFinalizeModal('Reboot Error',
                `<p>Reboot reported an error: </p>
                <p>${e.message}</p>
                <p>Try turning your server off/on, and the hit the 
                refresh button in your browser</p>`, true)
            return
        }
    }
    // while waiting for system to reboot, keep polling isPersistenceActive.
    // counters used to control the flow: 'ticks' is incremented each time 
    // setInterval callback is called, if countTicks if true. and 
    // 'progressBarProgressed' is incremented each time before 
    // isPersistenceActive is called. 
    // this means that, with a setting of 
    // ticksBetweenTries=10 and ticksBeforeFirstTry=5, isPersistenceActive 
    // will be called with a 5 second delay, and thereafter every 10 
    // seconds plus the time it takes to execute isPersistenceActive.
    let ticks = 0
    let countTicks = true
    const ticksBetweenTries = 10
    const ticksBeforeFirstTry = 5
    const progressBarProgressedSoFar = progressBarProgressed 
    showMessage.innerHTML = `Connection attempt \
        ${progressBarProgressed-progressBarProgressedSoFar + 1} \
        of ${progressBarSlices-progressBarProgressedSoFar} to hootNAS...`
    // start polling isPersistenceActive
    const interval = setInterval(async () => {
        if (ticks == ticksBeforeFirstTry && countTicks) {
            // pause counting ticks
            countTicks = false
            try {
                console.log('executing isPersistenceActive')
                const data = await post('api/isPersistenceActive')
                console.log(`Finished setup successfully`)
                showMessage.innerHTML = `Finished setup successfully`
                progressBarProgressed=
                    progressProgressBar(progressBarProgressed, 
                        progressBarSlices)
                clearInterval(interval)
                // show vue signIn component
                appstate.vue = 'signIn'
            }
            catch (e) {
                console.log(`isPersistenceActive error: ${e.message}`)
                progressBarProgressed=
                    progressProgressBar(progressBarProgressed, 
                    progressBarSlices)    
            }
            if (progressBarProgressed == progressBarSlices) {
                // max retries reached
                console.log('max retries reached')
                showMessage.innerHTML = `Cannot connect to hootNAS`
                if (isProductionMode()){
                showMaxRetriesMessage.innerHTML = 
                    `<p>This is most likely because hootNAS has been assigned \
                    a new IP address from your DHCP server. </p>\
                    <p>Please login to hootNAS via the \
                    terminal (tty) with username 'root' and password \
                    'pass1234' and run the command './tui-network-config.sh' \
                    to obtain the new IP address, or better yet, set a fixed \
                    IP address.</p> \ 
                    <p>Or hit F12 to open the browser debug window</p>`
                } else {
                    showMaxRetriesMessage.innerHTML = 
                    `<p>This is most likely because you haven't copied the  \
                    the ssh key before attempts were exhausted.</p>\
                    <p>after first reboot you have to run \
                    'ssh-copy-id root@&lt;IP address>' again in your terminal with \
                    password 'pass1234'. Then hit refresh in your browser.</p> \
                    <p>Or hit F12 to open the browser debug window</p>`
                }
                clearInterval(interval)
            }
            else {
                showMessage.innerHTML = `Connection attempt \
                    ${progressBarProgressed-progressBarProgressedSoFar +1} \
                    of ${progressBarSlices-progressBarProgressedSoFar} to hootNAS...`
            }
            countTicks = true
        }
        // number of ticks to wait before executing isPersistenceActive
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
                <p class="card-text">You must now finalize the setup, depending on your system setup, this may
                    take a while, so please be patient.
                </p>
                <h5 id="install-msg"></h5>
                <h6 id="install-max-msg"></h6>
                
                <div class="progress" style="height: 24px;margin-top: 20px;margin-bottom: 20px;">
                    <div class="progress-bar" id="install-progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                        style="width: 0%;">0%</div>
                </div>
                <div class="row">
                    <div class="col text-start"><button class="btn btn-primary" id="install-options-button" type="button"
                            v-on:click="goPrev">Prev</button>
                    </div>
                    <div class="col text-end"><button class="btn btn-primary" id="config-button" type="button"
                            v-on:click="configStoragePool">Finalize setup</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- modal box -->
        <div class="modal fade" id="finalize-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="finalize-modal-title">Configuration Error</h5>
                    </div>
                    <div id="finalize-modal-body" class="modal-body">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="finalize-modal-button"
                            data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 

<style></style>