/**
 * Services call various api's and handle the data returned. no experessjs 
 * code should be in the services.
 * @module services/shares
 */
import { selectNfsByUserId } from '../../webapi/nfs/selectNfsByUserId.mjs'

/**
 * @typedef {Object} Shares
 * @property {Array<Share>} share a NFS share
 */
/**
 * Selects NFS shares by id
 * @function _selectNfsByUserId
 * @async
 * @param {Number} userId user id
 * @returns {Shares} on resolve
 * @throws {Error} on reject
 * 
 */
export async function _selectNfsByUserId(userId) {
  try {
    const shares = await selectNfsByUserId(userId)
    return shares
  } catch (e) {
    e
    throw e
  }
}
