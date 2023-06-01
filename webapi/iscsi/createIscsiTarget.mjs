/*

# ******************************************************************************
#                              ISCSI
# ******************************************************************************
# create iscsi target
zfs create -ps -b 8K -V 10M bzpool/rudolf
# in /etc/tgt/targets.conf add
#<target iqn.2022-07.hootnas:hermans-share-3b5b3369>
#    backing-store /dev/zvol/bzpool/rudolf 
#    initiator-name (see below *)iqn.2022-07.com.ubuntu:01:60f3517884c3
#    incominguser herman pass1234
#</target> 
#    (*) can be found in file /etc/iscsi/initiatorname.iscsi on the 
#    client/initiator. or generate a new suitable iqn and put that 
#    in the same file.

tgt-admin --execute #read /etc/tgt/targets.conf and execute tgtadm commands
tgt-admin --show #show all the targets

# remove a target
tgt-admin --delete iqn.2022-07.hootnas:rudolf-7556e87f # delete from iscsi
# to delete permanently, delete it from /etc/tgt/targets.conf
zfs destroy -r bzpool/rudolf

# iscsi initiator/client
sudo apt -y install open-iscsi

# file /etc/iscsi/initiatorname.iscsi contains this node’s initiator name 
# and is generated during open-iscsi package installation
# InitiatorName=iqn.2022-07.com.ubuntu:01:60f3517884c3

# in file /etc/iscsi/iscsid.conf
# node.session.auth.authmethod = CHAP
# node.session.auth.username = rudolf
# node.session.auth.password = pass1234
sudo systemctl restart iscsid open-iscsi 
# discover target
sudo iscsiadm \
--mode discovery \
--type sendtargets \
--portal 192.168.139.139

# confirm status after discovery
sudo iscsiadm \
--mode node \
--op show 
# login
sudo iscsiadm \
--mode node \
--login 

sudo iscsiadm \
--mode node \
--login \
--targetname iqn.2022-07.hootnas:hermans-share-3b5b3369 \
--portal 192.168.139.139

# logout
sudo iscsiadm \
--mode node \
--logout 

sudo iscsiadm \
--mode node \
--logout \
--targetname iqn.2022-07.hootnas:hermans-share-3b5b3369 \
--portal 192.168.139.139

# delete a node from open-iscsi database
sudo iscsiadm \
--mode node \
--op delete \
--targetname iqn.2022-07.hootnas:hermans-share-3b5b3369 \
--portal 192.168.139.139



*/