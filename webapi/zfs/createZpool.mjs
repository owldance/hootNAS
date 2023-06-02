/**
 * Creates a zpool on the blockdevices in storagepool.vdevs. If 
 * storagepool.debug is true, the function execute the zpool create command 
 * with the 'n' option, it displays the configuration that would be used 
 * without actually creating the pool. The actual pool creation can still fail 
 * due to insufficient privileges or device sharing.
 * @module createZpool
 */
'use strict'
import { shell } from "../utilities/shell.mjs"
/**
 * see 'man zpoolprops' for below zpool properties
 * https://openzfs.github.io/openzfs-docs/man/7/zpoolprops.7.html
 * 
 * 
 * ashift=12
 * At pool creation, ashift=12 should always be used, except with SSDs that 
 * have 8k sectors where ashift=13 is correct. A vdev of 512 byte disks using 
 * 4k sectors will not experience performance issues, but a 4k disk using 512 
 * byte sectors will. Since ashift cannot be changed after pool creation, even 
 * a pool with only 512 byte disks should use 4k because those disks may need 
 * to be replaced with 4k disks or the pool may be expanded by adding a vdev 
 * composed of 4k disks. Because correct detection of 4k disks is not 
 * reliable, -o ashift=12 should always be specified during pool creation.
 *
 * See the OpenZFS FAQ for more details. 
 * https://openzfs.github.io/openzfs-docs/Project%20and%20Community/FAQ.html#advanced-format-disks
 * 
 * blockdev --getpbsz /dev/sda will show the physical block size reported by 
 * the device's ioctls.
 * 
 * autotrim=on
 * When set to on space which has been recently freed, and is no longer 
 * allocated by the pool, will be periodically trimmed. This allows block 
 * device vdevs which support BLKDISCARD, such as SSDs, or file vdevs on which 
 * the underlying file system supports hole-punching, to reclaim unused blocks. 
 * Automatic TRIM does not immediately reclaim blocks after a free. Instead, 
 * it will optimistically delay allowing smaller ranges to be aggregated into 
 * a few larger ones. These can then be issued more efficiently to the 
 * storage. TRIM on L2ARC devices is enabled by setting l2arc_trim_ahead > 0.
 * Be aware that automatic trimming of recently freed data blocks can put 
 * significant stress on the underlying storage devices. This will vary 
 * depending of how well the specific device handles these commands. For 
 * lower-end devices it is often possible to achieve most of the benefits of 
 * automatic trimming by running an on-demand (manual) TRIM periodically 
 * using the zpool trim command.
 *
 * see 'man zpool-features' for below zpool features
 * https://openzfs.github.io/openzfs-docs/man/7/zpool-features.7.html
 * 
 * feature@large_dnode=enabled
 * This feature allows the size of dnodes in a dataset to be set larger than 
 * 512B. This feature becomes active once a dataset contains an object with a 
 * dnode larger than 512B, which occurs as a result of setting the dnodesize 
 * dataset property to a value other than legacy. The feature will return to 
 * being enabled once all filesystems that have ever contained a dnode larger 
 * than 512 B are destroyed. Large dnodes allow more data to be stored in the 
 * bonus buffer, thus potentially improving performance by avoiding the use 
 * of spill blocks.
 * 
 * see 'man zfsprops' for below dataset properties
 * https://openzfs.github.io/openzfs-docs/man/7/zfsprops.7.html
 *
 * acltype=posixacl
 * indicates POSIX ACLs should be used. POSIX ACLs are specific to Linux and 
 * are not functional on other platforms. POSIX ACLs are stored as an extended 
 * attribute and therefore will not overwrite any existing NFSv4 ACLs
 * 
 * canmount=on|off|noauto
 * If this property is set to off, the file system cannot be mounted, and
 * is ignored by zfs mount -a.  Setting this property to off is similar to
 * setting the mountpoint property to none, except that the dataset still
 * has a normal mountpoint property, which can be inherited.  Setting this
 * property to off allows datasets to be used solely as a mechanism to in‐
 * herit properties.  One example of setting canmount=off is to have two
 * datasets with the same mountpoint, so that the children of both
 * datasets appear in the same directory, but might have different inher‐
 * ited characteristics.
 * 
 * When set to noauto, a dataset can only be mounted and unmounted explic‐
 * itly.  The dataset is not mounted automatically when the dataset is
 * created or imported, nor is it mounted by the zfs mount -a command or
 * unmounted by the zfs unmount -a command.

 * This property is not inherited.

 * relatime=on
 * when on, access time is only updated if the previous access time was 
 * earlier than the current modify or change time or if the existing access 
 * time hasn't been updated within the past 24 hours. 
 * 
 * normalization=formD
 * the file system should perform a unicode normalization of file names 
 * using algorithm 'formD', whenever two file names are compared. file names 
 * are always stored unmodified, names are normalized as part of any 
 * comparison process. the utf8only property is automatically set to on when 
 * normalization is set to anything else than 'none'.
 * This property cannot be changed after the file system is created.
 * 
 * mountpoint=path|none|legacy
 * Controls the mount point used for this file system.  See the Mount
 * Points section of zfsconcepts(7) for more information on how this prop‐
 * erty is used.
 * 
 * When the mountpoint property is changed for a file system, the file
 * system and any children that inherit the mount point are unmounted.  If
 * the new value is legacy, then they remain unmounted.  Otherwise, they
 * are automatically remounted in the new location if the property was
 * previously legacy or none, or if they were mounted before the property
 * was changed.  In addition, any shared file systems are unshared and
 * shared in the new location.
 * 
 * dnodesize=legacy|auto|1k|2k|4k|8k|16k
 * Specifies a compatibility mode or literal value for the size of dnodes
 * in the file system. The default value is legacy. Setting this prop‐
 * erty to a value other than legacy requires the large_dnode pool feature
 * to be enabled.
 * 
 * Consider setting dnodesize to auto if the dataset uses the xattr=sa
 * property setting and the workload makes heavy use of extended at‐
 * tributes.  This may be applicable to SELinux-enabled systems, Lustre
 * servers, and Samba servers, for example.  Literal values are supported
 * for cases where the optimal size is known in advance and for perfor‐
 * mance testing.
 * 
 * xattr=sa
 * System attribute based xattrs are enabled by setting the value to
 * sa.  The key advantage of this type of xattr is improved performance.
 * Storing extended attributes as system attributes significantly de‐
 * creases the amount of disk IO required. Up to 64K of data may be
 * stored per-file in the space reserved for system attributes. If there
 * is not enough space available for an extended attribute then it will be
 * automatically written as a directory based xattr. System attribute
 * based extended attributes are not accessible on platforms which do not
 * support the xattr=sa feature.
 * 
 * The use of system attribute based xattrs is strongly encouraged for
 * users of SELinux or POSIX ACLs.  Both of these features heavily rely on
 * extended attributes and benefit significantly from the reduced access
 * time.
 * 
 * @function createZpool
 * @async
 * @param {storagepool} storagepool
 * @returns {Promise<Error>} On reject
 * @returns {Promise<Message>} On resolve
 */
export async function createZpool(storagepool) {
    let ret = ''
    try {
        let zpoolOptions = 
        `-o ashift=12 \
        -o autotrim=on \
        -o feature@large_dnode=enabled \
        -O acltype=posixacl \
        -O xattr=sa \
        -O dnodesize=auto \
        -O normalization=formD \
        -O relatime=on \
        -O canmount=on \
        -O mountpoint=/dpool`
        let createZpoolString = ''
        // add debug -n option if true
        if (storagepool.debug)
            createZpoolString = `zpool create -n ${zpoolOptions} dpool `
        else
            createZpoolString = `zpool create ${zpoolOptions} dpool `
        // add vdevs
        for (const vdev of storagepool.vdevs) {
            // data is not a zfs type vdev, do not added to the string
            if (!vdev.type.startsWith('data'))
                createZpoolString += `${vdev.type} `
            // stripe is not a zfs redundancy, so do not added to the string
            if (vdev.redundancy !== 'stripe')
                createZpoolString += `${vdev.redundancy} `
            // get blockdevices in vdev as one string  
            createZpoolString += vdev.blockdevices.map(blockdevice => {
                // if debug is true, use the whole blockdevice
                if (storagepool.debug)
                    return `/dev/disk/by-id/${blockdevice.wwid}`
                else
                    return `/dev/disk/by-id/${blockdevice.wwid}-part2`
            }).join(' ')
            createZpoolString += ' '
        }
        ret = await shell(createZpoolString)
    } catch (e) {
        return Promise.reject(e)
    }
    return Promise.resolve(ret)
}