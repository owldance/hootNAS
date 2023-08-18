#!/bin/sh

#set -e

Fstab ()
{
	live_debug_log "9990-fstab.sh: Fstab BEGIN"
	if [ -n "${NOFSTAB}" ]
	then
	 	live_debug_log "9990-fstab.sh: Fstab END"
		return
	fi

	log_begin_msg "Configuring fstab"


	if ! grep -qs  "^${UNIONTYPE}" /root/etc/fstab
	then
		echo "${UNIONTYPE} / ${UNIONTYPE} rw 0 0" >> /root/etc/fstab
		live_debug_log "adding ${UNIONTYPE} / ${UNIONTYPE} rw 0 0 to /root/etc/fstab"
	fi

	if ! grep -qs "^tmpfs /tmp" /root/etc/fstab
	then
		echo "tmpfs /tmp tmpfs nosuid,nodev 0 0" >> /root/etc/fstab
		live_debug_log "tmpfs /tmp tmpfs nosuid,nodev 0 0"
	fi

	log_end_msg
	live_debug_log "9990-fstab.sh: Fstab END"
}
