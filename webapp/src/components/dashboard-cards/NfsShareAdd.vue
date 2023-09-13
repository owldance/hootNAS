<script setup>
/**
 * This is the dashboard component
 * @module nfsShareAdd
 */
/**
 * @typedef {Object} Share
 * @property {Number} id
 * @property {Number} user_id
 * @property {String} name a user assigned identifier, default null
 * @property {String} desc description, default null
 * @property {String} path default null
 * @property {String} sec default null
 * @property {Boolean} ro default true
 * @property {Boolean} sync default true
 * @property {Boolean} wdelay default true
 * @property {Boolean} hide default true
 * @property {Boolean} crossmnt default null
 * @property {Boolean} subtree_check default false
 * @property {Boolean} secure_locks default true
 * @property {String} mountpoint default null
 * @property {String} fsid default null
 * @property {Boolean} nordirplus default false
 * @property {String} refer default null
 * @property {String} replicas default null
 * @property {Boolean} pnfs default false
 * @property {Boolean} security_label default false
 * @property {Boolean} root_squash default true
 * @property {Boolean} all_squash default false
 * @property {Number} anonuid default null
 * @property {Number} anongid default null
 */

/**
 * @typedef {Object} nfsShares
 * @property {Array<Share>} share a NFS share
 */
import { inject, onMounted } from 'vue'
defineProps({
    name: String,
    desc: String,
    ro: Boolean
})
defineEmits(['update:name', 'update:desc', 'update:ro'])


function toggleArrow(event) {
    // get the the previous sibling of the event.target which is the <a> element
    const arrow = event.target.previousElementSibling
    // toggle the arrow which is the last character in the innerHTML
    if (arrow.innerHTML.slice(-1) === '▶') {
        arrow.innerHTML = arrow.innerHTML.slice(0, -1) + '▼'
    } else {
        arrow.innerHTML = arrow.innerHTML.slice(0, -1) + '▶'
    }
}
onMounted(() => {
    const collapseElementList = document.querySelectorAll('.collapse')
    // add event listener to all collapse elements
    collapseElementList.forEach((collapseEl) => {
        collapseEl.addEventListener('show.bs.collapse', toggleArrow)
        collapseEl.addEventListener('hide.bs.collapse', toggleArrow)
    })
})

</script>

<template>
    <div>
        <div><input :value="name" @input="$emit('update:name', $event.target.value)" /></div>
        <div><input :value="desc" @input="$emit('update:desc', $event.target.value)" /></div>
     
        <div id="nfs-machine-names">
            <div class="nav-link nav-link-nfs">Clients</div>
            <p>A whitespace-separated list of clients that are allowed to mount this filesystem:</p>
            <p class="form-floating">
                <textarea class="form-control" id="nfs-client-list"></textarea>
                <label for="nfs-client-list">Client list</label>
            </p>
            <a href="#collapse-machine-name-format" data-bs-toggle="collapse" class="nav-link">Supported machine name
                formats ▶</a>
            <div class="collapse" id="collapse-machine-name-format">
                <div><span class="fw-bold">Single host:</span> can be a FQDN or IP v4/v6 address</div>
                <div><span class="fw-bold">Multiple hosts:</span> in the format
                    <span class="text-danger-emphasis">address/netmask</span> where the netmask can be
                    specified in dotted-decimal format, or as a contiguous mask length. For example,
                    <span class="text-danger-emphasis">/255.255.252.0</span> or
                    <span class="text-danger-emphasis">/22</span> appended to the base of a IPv4 address.
                </div>
                <div><span class="fw-bold">Wildcard:</span> machine names may contain the wildcard
                    characters
                    <span class="text-danger-emphasis">*</span> and <span class="text-danger-emphasis">?</span>
                    or may contain character class lists within
                    <span class="text-danger-emphasis">[square brackets]</span>
                </div>
                <div><span class="fw-bold">Netgroups:</span> NIS netgroups may be given as
                    <span class="text-danger-emphasis">@group</span>. Only the host part of each netgroup members is
                    checked for membership.
                </div>
                <div><span class="fw-bold">Anonymous:</span> This is specified by a single
                    <span class="text-danger-emphasis">*</span> character (not to be confused with the wildcard above)
                    and will match all clients.
                </div>
            </div>
        </div>
        <hr />
        <div id="nfs-share-options">
            <a href="#collapse-options" data-bs-toggle="collapse" class="nav-link nav-link-nfs">Options ▶</a>
            <div class="collapse" id="collapse-options">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <div class="form-check form-switch">
                            <!-- <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" checked> -->
                            <input class="form-check-input" type="checkbox" role="switch" id="nfs-ro" 
                            :checked="ro" @change="$emit('update:ro', $event.target.checked)" />
                            <label class="form-check-label" for="nfs-ro">Read Only</label>
                        </div>
                        <div>
                            The share is Read Only.
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="nfs-kerb">
                            <label class="form-check-label" for="nfs-kerb">Kerberos Authentication</label>
                        </div>
                        <div>
                            Restrict access using cryptographic security, krb5 kerberos authentication.
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
                            Delay committing a write request to disc if another related write request may be in progress or
                            arrive
                            soon.
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
                </ul>
            </div>
        </div>
        <hr />
        <div id="nfs-user-mapping">
            <a href="#collapse-user-mapping" data-bs-toggle="collapse" class="nav-link nav-link-nfs">User mapping ▶</a>
            <ul class="list-group list-group-flush collapse" id="collapse-user-mapping">
                <li class="list-group-item">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="nfs-root-squash" checked>
                        <label class="form-check-label" for="nfs-root-squash">root Squash</label>
                    </div>
                    <div>
                        Maps requests from uid/gid 0 (root) to the anonymous uid/gid. Disabling this is mainly useful
                        for diskless clients.
                    </div>
                </li>
                <li class="list-group-item">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="nfs-all-squash">
                        <label class="form-check-label" for="nfs-all-squash">All Squash</label>
                    </div>
                    <div>
                        Maps all uids and gids to the anonymous uid/gid, this is useful for NFS-exported public FTP
                        directories, news spool directories, etc.
                        If disabled (the default) all uids and gids of user requests remian unchanged.
                    </div>
                </li>
                <li class="list-group-item">
                    <p>
                        anonuid and anongid
                    </p>
                    <p class="input-group">
                        <span class="input-group-text">anonuid</span>
                        <input type="text" class="form-control" id="nfs-anonuid">
                        <span class="input-group-text">anongid</span>
                        <input type="text" class="form-control" id="nfs-anongid">
                    </p>
                    <div>By default, a uid and gid of <span class="text-danger-emphasis">65534</span> for is used for
                        squashed
                        access. These values can be
                        explicitly set with these options. This option is primarily useful where you might want all
                        requests appear to be from one user.
                    </div>

                </li>

            </ul>
        </div>
    </div>
</template>
<style>
.nav-link-nfs {
    font-weight: bold;
}
</style>