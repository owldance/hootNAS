# hootNAS - ZFS concepts

For details, see [man zpoolconcepts](https://openzfs.github.io/openzfs-docs/man/7/zpoolconcepts.7.html)

## Pool

The `zpool` command configures ZFS storage pools.

A storage pool is a collection of virtual devices, that provides physical 
storage and data replication for ZFS datasets.  A storage pool is also known as 
a `zpool`.

A pool can have any number of virtual devices at the top of the configuration 
(known as root vdevs).  Data is dynamically distributed across all top-level 
devices to balance data among devices.  As new virtual devices are added, ZFS 
automatically places data on the newly available devices.

Note: when creating a zpool, the create command accepts the `-O` (Captial O) 
option to specify file system (dataset) properties in the root file system of 
the pool `-O file-system-property=value` see 
[zfsprops](https://openzfs.github.io/openzfs-docs/man/7/zfsprops.7.html). 
This is different from the `-o` (lowercase o) option which is used to specify 
pool properties 
[zpoolprops](https://openzfs.github.io/openzfs-docs/man/7/zpoolprops.7.html) 
and features 
[zpool-features](https://openzfs.github.io/openzfs-docs/man/7/zpool-features.7.html)

## Virtual device

A virtual device, also known as a `vdev`, describes a single `device` (e.g. a 
spinning harddisk, NVRAM disk, also called a blockdevice) or a collection of 
devices organized according to certain performance and fault characteristics. 

Virtual devices can be organized in the following ways:

## Vdevs for data

### stripe
- A stripe of two or more devices. Data is dynamically distributed across all 
devices to balance data among devices. A stripe has no redundancy.

### mirror
- A mirror of two or more devices. Data is replicated in an identical fashion 
across all components of a mirror. Redundancy is equal to the number of devices 
*n*-1.

### raidz1 (raidz), raidz2, raidz3
- Data and parity is striped across all devices within a raidz group. The 
minimum number of devices in a raidz group is one more than the number of 
parity disks. The recommended number is between 3 and 9 to help increase 
performance. raidz is an alias for raidz1. 

- A raidz vdev can have single, double, or triple parity i.e. reduncancy, 
meaning that the raidz group can sustain one, two, or three failures, 
respectively, without losing any data. A raidz group with *n* devices of size 
*x* with *p* parity devices, can hold approximately (*n*-*p*)**x* bytes and 
can withstand *p* devices failing without losing data. 

### draid1 (draid), draid2, draid3
- A variant of raidz that provides integrated distributed hot spares which 
allows for faster resilvering while retaining the benefits of raidz.  A draid
vdev is constructed from multiple internal raidz vdevs, which are also often 
called `groups`. draid is an alias for draid1.

- Unlike a raidz vdev, if hot spare devices are required, they **must** be in 
the draid vdev itself. A draid vdev can **not** use hot spares from the 
spare vdev.

## Specialty vdevs

### spare
- A pseudo-vdev which keeps track of available hot spares for a pool. ZFS 
allows devices to be associated with pools as "hot spares". These devices are 
not actively used in the pool, but when an active device fails, it is 
automatically replaced by a hot spare.

### log
- A separate log vdev for the ZFS Intent Log (ZIL), it can be of stripe or
mirror type only.

- By default, the intent log is allocated from blocks within the main pool. 
However, it might be possible to get better performance using a intent log 
vdev, especially with NVRAM devices.

### cache
- A vdev used to cache storage pool data. This vdev provide an additional 
layer of caching between main memory and disk. Using cache vdev provides the 
greatest performance improvement for random read-workloads of mostly static 
content.

- A Cache vdev can only be of stripe type only. If a read 
error is encountered on a cache device, that read I/O is reissued to the 
original storage pool device.

### dedup
- A vdev dedicated solely for deduplication tables, it can be of stripe or
mirror type only.

- The redundancy (i.e. number of redundant devices) of this vdev must match the 
redundancy of the data vdevs in the pool.

### special
- A vdev dedicated for allocating various kinds of internal metadata, 
and optionally small file blocks, it can be of stripe or mirror type only.

- The redundancy (i.e. number of redundant devices) of this vdev must match the 
redundancy of the data vdevs in the pool.

## Datasets

The `zfs` command configures ZFS datasets within a ZFS storage pool, as 
described above. 

Note: The `-o` (lowercase o) option is used to specify dataset properties 
[zfsprops](https://openzfs.github.io/openzfs-docs/man/7/zfsprops.7.html)

A dataset is identified by a unique path within the ZFS namespace e.g. 
`pool/{filesystem,volume,snapshot}` and can be one of the following types:

### filesystem
- Can be mounted within the standard system namespace and behaves like other 
file systems.

### volume
- A logical volume exported as a raw or block device.  This type of dataset 
should only be used when a block device is required.

### snapshot
- A read-only version of a file system or volume at a given point in time. It is 
specified as `filesystem@name` or `volume@name`.

### bookmark
- Much like a snapshot, but without the hold on on-disk data. It can be used as 
the source of a send (but not for a receive). It is specified as 
`filesystem#name` or `volume#name`.

## Contributing

All contributors are required to sign the hootNAS Contributor 
License Agreement prior to contributing code to an open source repository. This 
process is handled automatically by [cla-assistant](https://cla-assistant.io/). 
Simply open a pull request and a bot will automatically check to see if you 
have signed the latest agreement. If not, you will be prompted to do so as part 
of the pull request process. 

This project operates under the [hootNAS Code of Conduct](#placeholder). By 
participating in this project you agree to abide by its terms. 

## License

This is code is licensed under the Apache License 2.0. Full license is 
available [here](../LICENSE).

## Placeholder

Placeholder for future content