<script setup>
/**
 * This is the dashboard component
 * @module nfsShareAdd
 */

</script>

<template>
    <div class="card w-25">
        <!-- <div class="card" style="width: 18rem;" id="nfs-card" v-bind:class="{ 'd-none': cardHidden.nfs }"> -->
        <div class="card-header">
            Featured
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" checked>
                    <label class="form-check-label" for="nfs-ro">Read Only</label>
                </div>
                <div>
                    The share is Read Only.
                </div>
            </li>
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-sync" checked>
                    <label class="form-check-label" for="nfs-sync">Sync</label>
                </div>
                <div>
                    Reply to client requests only after the changes have been committed to storage.
                </div>
            </li>
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-wdelay" checked>
                    <label class="form-check-label" for="nfs-wdelay">Write Delay</label>
                </div>
                <div>
                    Delay committing a write request to disc if another related write request may be in progress or arrive
                    soon.
                </div>
            </li>
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-hide" checked>
                    <label class="form-check-label" for="nfs-hide">Hide</label>
                </div>
                <div>
                    <a href="#collapse-hide" data-bs-toggle="collapse" class="nav-link">Hides child NFSv2 and NFSv3 filesystems .....</a>
                </div>
                
                <div class="collapse" id="collapse-hide">If one filesystems is shared as a child of another filesystem, then the client will have
                    to mount both filesystems, otherwise it will see an
                    empty directory (i.e. the filesystem is "hidden") at the place where the child filesystem should have
                    been mounted.
                </div>
            </li>
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-crossmnt">
                    <label class="form-check-label" for="nfs-crossmnt">Crossmount</label>
                </div>
                <div>
                    If you disable "Hide" and enable "Crossmount" child filesystems are automatically shared.
                </div>
            </li>
            <li class="list-group-item">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="nfs-crossmnt" checked>
                    <label class="form-check-label" for="nfs-crossmnt">
                        Secure Locks</label>
                </div>
                <div>
                    This option requires the client to provide a user credential when issuing a lock request.
                </div>
            </li>

            <li class="list-group-item">A third item</li>
        </ul>
    </div>
</template>
<style></style>