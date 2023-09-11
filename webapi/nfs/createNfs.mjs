/*


# create a nfs share
mkdir -p /bzpool/share/herman-share
# all users on any client can read/write, files on server owned by "nobody"
chown nobody:nogroup /bzpool/share/herman-share
# in /etc/exports add
#/bzpool/share/herman-share      *(rw,all_squash,no_subtree_check)
exportfs -ra

# alternative to above
mkdir -p /bzpool/share/herman-share
# only root on client can write, all other users on client can only
# read. Files on server are owned by user "root"
# NOTE privilege escalation is possible on the NFS server, use only if 
# the client is trusted.
# in /etc/exports add
#/bzpool/share/herman-share      *(rw,sync,no_subtree_check,no_root_squash)
exportfs -ra


# remove nfs share

# nfs client connect
sudo apt install nfs-common
sudo mkdir /home/administrator/nfs
sudo mount 192.168.139.139:/bzpool/share/herman-share /home/administrator/nfs
# disconnect nfs
sudo umount /home/administrator/nfs

*/