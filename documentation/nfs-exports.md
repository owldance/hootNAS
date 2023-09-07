# The /etc/exports file 

This is to serve as an overwiew of which options are available in the 
`/etc/exports` file, and which options should be implemented in the webapp marked with a 👍 character.


Each line contains an export point and a whitespace-separated list of clients 
allowed to mount the file system at that point. Each listed client MAY be 
immediately followed by a parenthesized, comma-separated list of export 
options for that client. No whitespace is permitted between a client and its 
option list.

Example, only client2 has options, in effect only client2 will be able to
mount the export:

```
export client1 client2(option,option)
```

Also, each line may have one or more specifications for default options
after  the  path  name, in the form of a dash `'-'` followed by an option
list. The option list is used for all subsequent exports on that line only.

Example, client1 and client3 have default `'-'` options, client2 has specific
options:

```
export -option,option client1 client2(option,option) client3
```

A pound sign `'#'` introduces a comment to the end of 
the line. Entries may be continued across newlines using a backslash. If an 
export name contains spaces it should be quoted using double quotes. You can 
also specify spaces or other unusual character in the export name using a 
backslash followed by the character code as three octal digits. Blank lines are 
ignored. 

## Client machine name format

### Single host 
FQDN or IP v4/v6 address

### IP networks
Address/netmask where the netmask can be specified in dotted-decimal format, 
or as a contiguous mask length. For example, either `/255.255.252.0` or `/22` 
appended to the network base of a IPv4 address.

### Wildcards
Machine names may contain the wildcard characters `*` and `?`, or may contain 
character class lists within [square brackets].

### Netgroups
NIS netgroups may be given as `@group`. Only the host part of each netgroup
members is checked for membership.

### Anonymous
This is specified by a single `*` character (not to be confused with
the wildcard entry above) and will match all clients.

## Security

### 👍 sec= 
Restrict access using restrict RPCSEC_GSS security. [RPCSEC_GSS](https://docs.oracle.com/cd/E19683-01/816-1331/6m7oo9sn3/index.html#overview-13) integrates with 
with RPC, and is an additional layer on top of GSS-API.

The `sec=` option, followed by a colon-delimited list of security flavors, 
restricts the export to clients using those flavors. Available security flavors  include sys (the default--no cryptographic security), `krb5` (authentication 
only),  `krb5i`  (integrity protection), and `krb5p` (privacy protection). For 
the purposes of security flavor negotiation, order counts: preferred flavors 
should be listed first. The order of the `sec=` option with respect to the 
other options does not matter, unless you want some options to be enforced 
differently depending on flavor. In that case you may include multiple `sec=` 
options, and following options will be enforced only for access using flavors 
listed in the immediately preceding `sec=` option. The only options that are 
permitted to vary in this way are `ro`, `rw`, `no_root_squash`, `root_squash`, 
and `all_squash`.
### secure (default) / insecure
This option requires that requests not using gss, originate on an Internet port 
less than IPPORT_RESERVED (1024). This option is on by default. 
### 👍 ro (default) / rw
The default is to disallow any write request on this NFS volume. 
### 👍 sync (default) / async
Reply to requests only after the changes have been committed to storage.
### 👍 wdelay (default) / no_wdelay
Write delay is enabled by default. The NFS server will delay committing a write 
request to disc slightly if it suspects that another related write request may 
be in progress or may arrive soon. The `no_wdelay` option has no effect if 
`async` is also set.
### 👍 hide (default) / nohide
The `hide` option explicitly hides subordinate filesystems for NFSv2 and NFSv3.
NFSv4 never hides subordinate filesystems.

A filesystem is "hidden" if a server exports two filesystems one of which is 
mounted on the other, then the client will have to mount both filesystems 
explicitly to get access to them. If the client only mounts the parent, it 
will see an empty directory at the place where the other filesystem is mounted.
That filesystem is "hidden". 

Setting the `nohide` option on a filesystem causes it not to be hidden, and 
is only effective on single host exports. It should be used with due care, and 
only after confirming that the client system copes with the situation effectively.
### 👍 crossmnt / nocrossmnt
This option is similar to `nohide` but with `nohide` the child filesystem needs 
to be explicitly exported, with `crossmnt` it need not. `nocrossmnt` is rarely
useful.
### 👍 no_subtree_check (default) / subtree_check
This option disables subtree checking, it is the default as subtree checking 
tends to cause more problems than it is worth. If you put
neither `no_subtree_check` nor `subtree_check`, `exportfs` will warn you that 
the change is pending.

If you genuinely require subtree checking, you should explicitly put 
`subtree_check` option in the exports file.
### 👍 auth_nlm, secure_locks (default) / insecure_locks, no_auth_nlm
This option (the two names are synonymous) tells the NFS server to require a 
lock request (i.e. requests which use the NLM protocol) to hold a credential 
for a user who has read access to the file. 
### mountpoint=path, mp=path
This option (the two names are synonymous) makes it possible to only export a 
directory if it has successfully been mounted. If a path is given 
(e.g.  `mountpoint=/path` or `mp=/path`) then the nominated path must be a 
mountpoint for the export point to be exported. If no path is given 
then the export point must also be a mount point. If it isn't then the export
point is not exported. This allows you to be sure that the directory underneath
a mountpoint will never be exported by accident if, for example, the 
filesystem failed to mount due to a disc error.
### fsid=num|root|uuid 
Alternate NFS filesystem identifier, not required for ZFS as is generates its
own filesystem identifiers.
### nordirplus 
When set, READDIRPLUS requests from NFS clients will return NFS3ERR_NOTSUPP. 
NFSv3 clients only.
### refer=path@host[+host][:path@host[+host]]
A client referencing the export point will be directed to choose from the 
given list an alternative location for the filesystem.
### replicas=path@host[+host][:path@host[+host]]
If the client asks for alternative locations for the export point, it will be 
given this list of alternatives.
### no_pnfs (default) / pnfs
This option disables the use of the pNFS (parallel NFS) extension.
### security_label
With this option set, clients using NFSv4.2 or higher will be able to set and 
retrieve SELinux security labels/context.

## User ID Mapping

### 👍 root_squash (default) / no_root_squash
Map requests from uid/gid 0 (root) to the anonymous uid/gid. `no_root_squash` 
option is mainly useful for diskless clients.
## 👍 no_all_squash (default) / all_squash
Keep all uids and gids of user requests as they are. `all_squash` map all uids 
and gids to the anonymous uid/gid. Useful for NFS-exported public FTP 
directories, news spool directories, etc. 
## 👍 anonuid and anongid
By default, exportfs chooses a uid and gid of 65534 for squashed access. These
values can be explicitly set with these options. This option is primarily 
useful where you might want all requests appear to be from one user.

To apply changes to `/etc/exports` file, run 
```bash
exportfs  -ra
```


