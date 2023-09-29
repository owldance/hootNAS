/**
 * Setting up Samba as Domain member
 * @module setupSambaAsDomainMember
 * @link https://wiki.samba.org/index.php/Setting_up_Samba_as_a_Domain_Member

# 2.1 General Preparation
# skip to 2.2 if samba have not been installed on this maschine

# Verify that no Samba processes are running
ps ax | egrep "samba|smbd|nmbd|winbindd"
# stop or kill all processes
systemctl stop nmbd smbd samba winbind
ps ax | grep winbindd | grep -v grep | cut  -b -8 | xargs kill -9 $1
# test grep cut output
# ps ax | grep postgres | grep -v grep | cut  -b -8 | xargs -n1

# remove samba database files tdb ldb
find /run/samba -iname '*.[tl]db' -type f -delete
find /var/lib/samba -iname '*.[tl]db' -type f -delete
find /var/cache/samba -iname '*.[tl]db' -type f -delete
find /var/lib/samba/private -iname '*.[tl]db' -type f -delete

# 2.2 Preparing a Domain Member to Join an Active Directory Domain

# 2.2.1 Configuring DNS
# list nics
ip -a link
# find gateway
ip -a route
# show ip address
ip -a addr
# details about the uplink DNS servers currently in use
# because /etc/resolv.conf is dynamic and managed by systemd-resolved
resolvectl status


# ubuntu server netplan uses "networkd" as renderer, so all network 
# configuration is set in the netplan yaml config file

dns='192.168.122.225' # dns ip
hostip='192.168.122.159' 
hostname='hootnas'
route='192.168.122.0/24'
gateway='192.168.122.1'
dcip='192.168.122.225' # dc ip
dchostname='BIGDC'
domain='bigcorp.local'
realm='BIGCORP.LOCAL'
ntp='BIGDC.bigcorp.local'
workgroup='BIGCORP'

# set static ip
cat <<HEREDOC > /etc/netplan/00-installer-config.yaml
network:
  version: 2
  ethernets:
    enp1s0:
      dhcp4: no
      addresses: [$hostip/24]
      routes:
        - to: $route
          via: $gateway
          metric: 100
        - to: default
          via: $gateway
          metric: 200
      nameservers:
        search: [$domain]
        addresses: [$dns]
HEREDOC

# set dhcp with custom nameservers
# cat <<HEREDOC > /etc/netplan/00-installer-config.yaml
# network:
#   version: 2
#   ethernets:
#     enp1s0:
#       dhcp4: yes
#       dhcp4-overrides:
#         use-dns: no
#       nameservers:
#         search: [bigcorp.local]
#         addresses: [$dns]
# HEREDOC

# apply new settings without try
netplan -d apply
# new namserver now present in /etc/resolv.conf

# 2.4 Testing DNS resolution
host $dchostname.$domain # forward (A record)
host $dcip # reverse (PTR record 144.139.168.192.in-addr.arpa)
host -t SRV _ldap._tcp.$domain # SRV record

# 2.8.1 Configuring Kerberos
# overwrite /etc/krb5.conf
cat <<HEREDOC > /etc/krb5.conf
# The Samba teams recommends to no set any further parameters
[libdefaults]
  default_realm = $realm
  dns_lookup_realm = false
  dns_lookup_kdc = true
HEREDOC

# 2.8.2 Configuring Time Synchronisation
# set timezone
timedatectl list-timezones
timedatectl set-timezone Europe/Copenhagen
# set ntp server
sed -i "s/#NTP=/NTP=$dchostname.$domain/" /etc/systemd/timesyncd.conf
sed -i 's/#FallbackNTP/FallbackNTP/' /etc/systemd/timesyncd.conf
cat /etc/systemd/timesyncd.conf
systemctl restart systemd-timesyncd

# 2.8.3 Local Host Name Resolution
sed -i /127.0.1.1/d  /etc/hosts # remove the line "127.0.1.1 hostname"
sed -i "2i $hostip  $hostname.$domain  $hostname" /etc/hosts
cat /etc/hosts
getent hosts hootnas
# must yield <hostip> hootnas.bigcorp.local hootnas

# 3 Installing Samba
# https://wiki.samba.org/index.php/Distribution-specific_Package_Installation#Ubuntu

apt install --yes acl
apt install --yes attr
apt install --yes winbind
apt install --yes libpam-winbind
apt install --yes libnss-winbind
apt install --yes krb5-config 
apt install --yes krb5-user
apt install --yes python3-setproctitle

# 4 Configuring Samba
# 4.2 Setting up a Basic smb.conf File
cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
# overwrite /etc/samba/smb.conf
cat <<HEREDOC > /etc/samba/smb.conf
# A basic smb.conf using the 'autorid' idmap backend
# For information on the parameters, see the smb.conf(5) man page.
[global]
  security = ADS
  workgroup = $workgroup
  realm = $realm

  log file = /var/log/samba/%m.log
  log level = 1

  # Default ID mapping configuration using the autorid
  # idmap backend. This will work out of the box for simple setups
  # as well as complex setups with trusted domains.
  idmap config * : backend = autorid
  idmap config * : range = 10000-9999999

  # Mapping the Domain Administrator Account to the Local root User
  # For further details, see username map parameter in the smb.conf(5) man page. 
  username map = /usr/local/samba/etc/user.map
  # https://www.samba.org/samba/security/CVE-2020-25717.html
  min domain uid = 0

  # Enable Extended ACL Support on a Unix domain member
  vfs objects = acl_xattr
  map acl inherit = yes

  #> shares
  
HEREDOC

# 4.3 Mapping the Domain Administrator Account to the Local root User
# Create the /usr/local/samba/etc/user.map file with the following content:
mkdir -p /usr/local/samba/etc
cat <<HEREDOC > /usr/local/samba/etc/user.map
# For further details, see username map parameter in the smb.conf(5) man page. 
!root = $workgroup\Administrator $workgroup\administrator
HEREDOC

smbcontrol all reload-config

# 5 Joining the Domain
# Obtain Kerberos ticket-granting ticket for Administrator
echo '!pass1234' | kinit Administrator@BIGCORP.LOCAL
# To join the host to an Active Directory (AD)
net ads join -U Administrator --use-krb5-ccache=CCACHE
#Password for [BIGCORP\Administrator]:
#Using short domain name -- bigcorp
#Joined 'hootnas' to dns domain 'bigcorp.local'

# 6 Configuring the Name Service Switch
# To enable the name service switch (NSS) library to make domain users and 
# groups available to the local system: 
sed -i 's/systemd/winbind/' /etc/nsswitch.conf
# Keep the files entry as first source for both databases. This enables NSS 
# to look up domain users and groups from the /etc/passwd and /etc/group files 
# before querying the Winbind service.

# 7 Starting the Services
# Start the following services to have a fully functioning Unix domain member:
#     The smbd service
#     The nmbd service
#     The winbindd service
# If you do not require Network Browsing, you do not need to start the 
# nmbd service on a Unix domain member.
systemctl disable nmbd

reboot now

# 8 Testing the Winbindd Connectivity
wbinfo --ping-dc
#checking the NETLOGON for domain[BIGCORP] dc connection to "BIGDC.bigcorp.local" succeeded

# Looking up Domain Users and Groups
getent passwd BIGCORP@Administrator
#bigcorp\administrator:*:110500:110513::/home/bigcorp/administrator:/bin/false
getent group "BIGCORP\\Domain Users"
#bigcorp\domain users:x:110513:
getent passwd # list all local
getent group # list all local

# Assigning File Permissions to Domain Users and Groups
# The name service switch (NSS) library enables you to use domain user accounts
# and groups in commands. For example set the owner of a file to the 
# domain user "demouser" and the group to the "Domain Users" domain group
chown "BIGCORP\\demouser:BIGCORP\\Domain Users" file.txt
*/


