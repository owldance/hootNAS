/**
 * Cetting SAMBA Share Using Windows ACLs on Server role: ROLE_STANDALONE
 * @module createPosixSmbShare
 * @link https://wiki.samba.org/index.php/Setting_up_a_Share_Using_Windows_ACLs


# Granting the SeDiskOperatorPrivilege Privilege
# Only users and groups having the SeDiskOperatorPrivilege privilege granted 
# can configure share permissions. 
# It is recommended to grant the privilege to a group instead of individual 
# accounts. This enables you to add and revoke the privilege by updating the 
# group membership.

# Enable Extended ACL Support on a Unix domain member
# /etc/samba/smb.conf [global] section add:
vfs objects = acl_xattr
map acl inherit = yes
min domain uid = 0

# On the Samba server that holds the share, grant the SeDiskOperatorPrivilege 
# privilege to the 'Samba Operators' AD group 

echo '!pass1234' | kinit Administrator@BIGCORP.LOCAL

net rpc rights \
grant "BIGCORP\Samba Operators" \
SeDiskOperatorPrivilege \
-U "BIGCORP\Administrator" \
-S hootnas.bigcorp.local \
--use-krb5-ccache=CCACHE

# list all users and groups with SeDiskOperatorPrivilege privilege granted
net rpc rights list privileges \
SeDiskOperatorPrivilege \
-U "BIGCORP\Administrator" \
-S hootnas.bigcorp.local \
--use-krb5-ccache=CCACHE

# Adding a Share
mkdir -p /srv/samba/Demo/

# To enable other than the domain user Administrator to set permissions on 
# Windows, grant full control (rwx) to the Samba Operators group
chown root:"BIGCORP\\Samba Operators" /srv/samba/Demo/
chmod 0770 /srv/samba/Demo/

# add a share to /etc/samba/smb.conf
[Demo]
    path = /srv/samba/Demo/
    read only = no
    acl_xattr:ignore system acls = yes


smbcontrol all reload-config

# set full permissions
setfacl -d -m u:bigcorp\\helmut:rwx /srv/samba/Demo 
setfacl -d -m g:bigcorp\\helmut:rwx /srv/samba/Demo 
setfacl -m u:bigcorp\\helmut:rwx /srv/samba/Demo 

# remove full permissions
setfacl -d -x u:bigcorp\\helmut /srv/samba/Demo
setfacl -d -x g:bigcorp\\helmut /srv/samba/Demo
setfacl -x u:bigcorp\\helmut /srv/samba/Demo


mkdir -p /srv/samba/helmut
chown root:"BIGCORP\\helmut" /srv/samba/helmut
chmod 0770 /srv/samba/helmut

# add a share to /etc/samba/smb.conf
[helmut]
    path = /srv/samba/helmut
    read only = no
    acl_xattr:ignore system acls = yes


net rpc rights \
revoke "BIGCORP\helmut" \
SeDiskOperatorPrivilege \
-U "BIGCORP\Administrator" \
-S hootnas.bigcorp.local \
--use-krb5-ccache=CCACHE

*/