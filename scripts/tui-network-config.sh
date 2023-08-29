#!/bin/bash
#
# This script displays all configured network addresses to the user, if no 
# addresses found, it will automatically retry every 10 seconds, or the user 
# can manually configure all ethernet network interfaces, or revert to DHCP.
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

# Display infobox before checking all network interfaces for 
# configured network addresses
#
# function checknetwork
# returns {Number}              0, on success, otherwise 1
function checknetwork() {
  dialog --title "Checking network connection" \
    --backtitle "hootNAS Configuration" \
    --infobox "\\nPlease wait while checking all network interfaces for \
configured network addresses ...." 5 50
  sleep 5
  if [ "$(hostname -I)" != "" ]; then
    return 0
  else
    return 1
  fi
}

# Display an error message in a yesno box
#
# function showerror
# returns {Number}              0, on OK button, 1 on Retry button
function showerror() {
  dialog --timeout 5 --title "Network error" \
    --backtitle "hootNAS Configuration" \
    --no-label "Exit to shell" \
    --yes-label "Configure network" \
    --yesno "\\nNo network addresses found, automatic retry in 5 seconds. \
Make sure your network cable is plugged into your computer." 10 50
  return $?
}

# Displays msgbox with the host's ip address(es).
#
# function hostaddress
# returns {Number}              0, on OK button, 1 on Retry button
function hostaddress() {
  browser_adrs=""
  adrs=$(hostname -I)
  for adr in ${adrs[@]}; do
    browser_adrs+="http://$adr \\n"
  done
  dialog --title "Success!" \
    --backtitle "hootNAS Configuration" \
    --no-label "Configure network" \
    --yes-label "Exit to shell" \
    --yesno "\\nTo proceede with install, please enter one of the following \
adresses into your browser \\n\\n$browser_adrs" $((9 + ${#adrs[@]})) 50
  return $?
}

# Display form that enables the user to enter address, gateway and 
# nameserver ip's.
#
# function doconfig
# returns {Number}              0, on OK button, 1 on Reset button
function doconfig() {
  while :; do
    res=$(dialog --title "Manual network configuration" \
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
  dialog --title "New network configuration" \
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

# Display infobox before applying dhcp network configuration
#
# function applydhcp
# returns {Number}              0, on success, otherwise 1
function applydhcp() {
  dialog --title "Reset network" \
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

#
# Main loop
#
toshell=1
while [ $toshell = 1 ]; do
  if checknetwork; then
    hostaddress
    case $? in
    0) # --yes-label, exit to shell
      toshell=0
      ;;
    1) # --no-label, configure network
      if doconfig; then
        applyconfig
      else # user pressed Cancel in doconfig
        applydhcp
      fi
      ;;
    esac
  else # no network
    showerror
    case $? in
    0) # --yes-label, configure network
      if doconfig; then
        applyconfig
      else # user pressed Cancel in doconfig
        applydhcp
      fi
      ;;
    1) # --no-label, exit to shell
      toshell=0
      ;;
    *) # --timeout, automatic retry
      ;;
    esac
  fi
done

clear
echo "execute './tui-network-config.sh' to configure network again"

