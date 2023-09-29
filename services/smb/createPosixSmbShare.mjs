/**
 * Cetting SAMBA Share Using POSIX ACLs on Server role: ROLE_STANDALONE
 * @module createPosixSmbShare
 * @link https://wiki.samba.org/index.php/Setting_up_a_Share_Using_POSIX_ACLs

# create samba share
# in /etc/samba/smb.conf
#[herman]
#        path = /bzpool/share/herman
#        read only = no
#        inherit permissions = yes
# create system user
useradd -M -s /sbin/nologin herman
echo "pass1234:pass1234" | chpasswd
# add user/password to the local smbpasswd file
(echo pass1234; echo pass1234) | smbpasswd -a herman -s
pdbedit -L # list samba users
mkdir -p /bzpool/share/herman
chown herman:herman /bzpool/share/herman/
smbcontrol all reload-config
smbstatus --shares # list active connections
ls /var/lib/samba/usershares # list all shares

# remove samba share
smbcontrol all close-share herman
# (remove from bzdb)
# (remove from /etc/samba/smb.conf)
smbcontrol all reload-config
rm -r /bzpool/share/herman
smbpasswd -x herman # delete user from the local smbpasswd file

# samba client connect via file explorer, or 
sudo apt install smbclient
smbclient -U herman //192.168.139.139/herman


*/