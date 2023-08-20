#!/bin/bash
#
# Manually configure all ethernet links
#
# requires                      apt install --yes dialog
#
# returns {Number}              0, on success, otherwise exit code of the last
#                               failed command
#

# Checks ipv4 address for valid format
#
# function checkip4
# param {String} address        ipv4 in dot notation
# returns {Number}              0, on success, otherwise 1
function checkip4() {
  ip="$1"
  # when performing a regex match, bash creates an array variable BASH_REMATCH
  # with the full match in 0 and any captured groups in subsequent positions
  ip_pattern='^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$'
  if [[ ! $ip =~ $ip_pattern ]]; then
    return 1
  fi
  # check octets
  for i in {1..4}; do
    if [[ ${BASH_REMATCH[$i]} -gt 255 ]]; then
      return 1
    fi
  done
  # zero not permitted for first octet
  if [[ ${BASH_REMATCH[1]} -eq 0 ]]; then
    return 1
  fi
  return 0
}

# Displays infobox before checking if ubuntu.com is reachable 
#
# function internet
# returns {Number}              0, on success, otherwise 1
function internet() {
  dialog --title "Checking Internet Connection" \
    --backtitle "hootNAS Configuration" \
    --infobox "\\nPlease wait while trying to \
establish a connection to http://ubuntu.com ...." 5 50
  sleep 2
  echo -e "GET http://ubuntu.com HTTP/1.0\n\n" |
    nc -w 10 ubuntu.com 80 >/dev/null 2>&1
  return $?
}

# Displays an error message in a yesno box
#
# function showerror
# returns {Number}              0, on OK button, 1 on Retry button
function showerror() {
  dialog --title "Error!" \
    --backtitle "hootNAS Configuration" \
    --no-label "Retry" \
    --yes-label "OK" \
    --yesno "\\nCould not establish a connection to ubuntu.com, press OK to \
configure your network manually. Make sure your network cable is plugged \
into your computer." 10 50
  return $?
}

# Displays msgbox with the host's ip address(es). Assumes that network is 
# correctly configured and ubuntu.com is reachable.
#
# function hostaddress
# returns {Number}              0, on OK button, 1 on Retry button
function hostaddress() {
  adrs=$(hostname -I)
  for adr in ${adrs[@]}; do
    browser_adrs+="http://$adr \\n"
  done
  dialog --title "Success!" \
    --backtitle "hootNAS Configuration" \
    --ok-label "Retry" \
    --msgbox "\\nTo proceede with install, please enter one of the following \
adresses into your browser \\n\\n$browser_adrs" $((9 + ${#adrs[@]})) 50
  browser_adrs=""
  return 0
}

# Displays form that enables the user to enter address, gateway and 
# nameserver ip's.
#
# function doconfig
# returns {Number}              0, on OK button, 1 on Reset button
function doconfig() {
  while :; do
    res=$(dialog --title "Manual Network Configuration" \
      --backtitle "hootNAS Configuration" \
      --output-separator "#" \
      --cancel-label "Reset" \
      --form "\\nPlease enter your network information in dot notation \
e.g. 10.0.0.23 then press OK, or press Reset to revert to \
DHCP configuration" 14 50 3 \
      "ip address :" 1 1 "$address" 1 15 15 0 \
      "gateway    :" 2 1 "$gateway" 2 15 15 0 \
      "nameserver :" 3 1 "$nameserver" 3 15 15 0 \
      3>&1 1>&2 2>&3 3>&-)

    # if user pressed 'cancel' then return
    [ $? == 1 ] && return 1

    # get user values from dialog form
    address=$(echo $res | cut -d "#" -f 1)
    gateway=$(echo $res | cut -d "#" -f 2)
    nameserver=$(echo $res | cut -d "#" -f 3)

    # check ip's
    errmsg=""
    if ! checkip4 $address; then
      errmsg+="invalid address $address\\n"
    fi
    if ! checkip4 $gateway; then
      errmsg+="invalid gateway $gateway\\n"
    fi
    if ! checkip4 $nameserver; then
      errmsg+="invalid nameserver $nameserver\\n"
    fi
    if [ "$errmsg" != "" ]; then
      dialog --title "Error!" \
        --backtitle "hootNAS Configuration" \
        --msgbox "\\n$errmsg" 8 50
    else
      break
    fi
  done
  return 0
}

# Displays infobox before applying network configuration
#
# function applyconfig
# returns {Number}              0, on success, otherwise 1
function applyconfig() {
  # all ethernet links: en*
  dialog --title "New Network Configuration" \
    --backtitle "hootNAS Configuration" \
    --infobox "\\nApplying your new network, \
this may take some time.\\n\\n" 10 50
  sleep 2
  cat <<EOF >/etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      match:
        name: en*
      dhcp4: no
      gateway4: $gateway
      addresses: [$address/24]
      nameservers:
        addresses: [$nameserver]
EOF
  netplan apply >/dev/null 2>&1
  return $?
}

# Displays infobox before applying dhcp network configuration
#
# function applydhcp
# returns {Number}              0, on success, otherwise 1
function applydhcp() {
  dialog --title "Reset Network" \
    --backtitle "hootNAS Configuration" \
    --infobox "\\nReverting network back to DHCP configuration, \
this may take some time.\\n\\n" 10 50
  sleep 2
  # all ethernet links: en*
  cat <<EOF >/etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      match:
        name: en*
      dhcp4: yes
EOF
  netplan apply >/dev/null 2>&1
  return $?
}

# main loop
while :; do
  if internet; then
    hostaddress
  else # ubuntu.com not reachable
    if showerror; then
      if doconfig; then
        applyconfig
      else # user pressed Cancel in doconfig
        applydhcp
      fi
    fi
  fi
done

