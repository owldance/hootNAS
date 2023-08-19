#!/bin/sh

#set -e

copy_live_to ()
{
	copyfrom="${1}"
	copytodev="${2}"
	copyto="${copyfrom}_swap"
	live_debug_log "9990-toram-todisk.sh: copy_live_to BEGIN"
	live_debug_log "copyfrom: ${copyfrom}"
	live_debug_log "copytodev: ${copytodev}"
	live_debug_log "copyto: ${copyto}"

	if [ -z "${MODULETORAM}" ]
	then
		size=$(fs_size "" ${copyfrom}/ "used")
		live_debug_log "used/free fs kbytes + 5% more: ${size}"
	else
		MODULETORAMFILE="${copyfrom}/${LIVE_MEDIA_PATH}/${MODULETORAM}"

		if [ -f "${MODULETORAMFILE}" ]
		then
			size=$( expr $(ls -la ${MODULETORAMFILE} | awk '{print $5}') / 1024 + 5000 )
		else
			log_warning_msg "Error: toram-module ${MODULETORAM} (${MODULETORAMFILE}) could not be read."
			live_debug_log "Error: toram-module ${MODULETORAM} (${MODULETORAMFILE}) could not be read."
			live_debug_log "copy_live_to END"
			return 1
		fi
	fi

	if [ "${copytodev}" = "ram" ]
	then
		# copying to ram:
		freespace=$(awk '/^MemFree:/{f=$2} /^Cached:/{c=$2} END{print f+c}' /proc/meminfo)
		mount_options="-o size=${size}k"
		free_string="memory"
		fstype="tmpfs"
		dev="/dev/shm"
		live_debug_log "copying to ram: freespace: ${freespace}"
	else
		# it should be a writable block device
		live_debug_log "copying to block device: ${copytodev}"
		if [ -b "${copytodev}" ]
		then
			dev="${copytodev}"
			free_string="space"
			fstype=$(get_fstype "${dev}")
			freespace=$(fs_size "${dev}")
		else
			log_warning_msg "${copytodev} is not a block device."
			live_debug_log "${copytodev} is not a block device."
			live_debug_log "copy_live_to END"
			return 1
		fi
	fi

	if [ "${freespace}" -lt "${size}" ]
	then
		log_warning_msg "Not enough free ${free_string} (${freespace}k free, ${size}k needed) to copy live media in ${copytodev}."
		live_debug_log "Not enough free ${free_string} (${freespace}k free, ${size}k needed) to copy live media in ${copytodev}."
		return 1
	fi

	# Custom ramdisk size
	if [ -z "${mount_options}" ] && [ -n "${ramdisk_size}" ]
	then
		# FIXME: should check for wrong values
		mount_options="-o size=${ramdisk_size}"
	fi

	# begin copying (or uncompressing)
	live_debug_log "begin copying (or uncompressing)"
	mkdir "${copyto}"
	log_begin_msg "mount -t ${fstype} ${mount_options} ${dev} ${copyto}"
	live_debug_log "mount -t ${fstype} ${mount_options} ${dev} ${copyto}"
	mount -t "${fstype}" ${mount_options} "${dev}" "${copyto}"

	if [ "${extension}" = "tgz" ]
	then
		cd "${copyto}"
		tar zxf "${copyfrom}/${LIVE_MEDIA_PATH}/$(basename ${FETCH})"
		rm -f "${copyfrom}/${LIVE_MEDIA_PATH}/$(basename ${FETCH})"
		mount -r -o move "${copyto}" "${rootmnt}"
		cd "${OLDPWD}"
	else
		if [ -n "${MODULETORAMFILE}" ]
		then
			if [ -x /bin/rsync ]
			then
				echo " * Copying $MODULETORAMFILE to RAM" 1>/dev/console
				rsync -a --progress ${MODULETORAMFILE} ${copyto} 1>/dev/console # copy only the filesystem module
			else
				cp ${MODULETORAMFILE} ${copyto} # copy only the filesystem module
			fi
		else
			if [ -x /bin/rsync ]
			then
				echo "copying whole medium to RAM... this may take a while" 1>/dev/console
				live_debug_log "copying whole medium to RAM"
				live_debug_log "rsync -a --progress ${copyfrom}/* ${copyto}"
				rsync -a ${copyfrom}/* ${copyto} 
				#rsync -a --progress ${copyfrom}/* ${copyto} 1>/dev/console  # "cp -a" from busybox also copies hidden files
			else
				echo "copying whole medium to RAM... this may take a while" 1>/dev/console
				live_debug_log "copying whole medium to RAM"
				live_debug_log "cp -a ${copyfrom}/* ${copyto}/"
				cp -a ${copyfrom}/* ${copyto}/
				if [ -e ${copyfrom}/${LIVE_MEDIA_PATH}/.disk ]
				then
					live_debug_log "cp -a ${copyfrom}/${LIVE_MEDIA_PATH}/.disk ${copyto}"
					cp -a ${copyfrom}/${LIVE_MEDIA_PATH}/.disk ${copyto}
				fi
			fi
		fi

		umount ${copyfrom}
		live_debug_log "mount -r -o move ${copyto} ${copyfrom}"
		mount -r -o move ${copyto} ${copyfrom}
	fi

	rmdir ${copyto}
	live_debug_log "9990-toram-todisk.sh: copy_live_to END"
	return 0
}
