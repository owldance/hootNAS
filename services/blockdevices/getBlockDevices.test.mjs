import { getBlockDevices } from "./getBlockDevices.mjs"

const blockDevices = await getBlockDevices()
console.log(blockDevices)