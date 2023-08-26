/**
 * Execute a shell command locally or remote
 * @module shell
 */
'use strict'
import { spawn } from 'child_process'
/**
 * Execute a shell command locally. if the environment variable HOOT_REPO is 
 * set, then execute the command on the remote hootNAS system as root. this 
 * requires that the local user has ssh access to the remote system as root
 * without a password, see /documentation/getstarted.md for more information.
 * @async 
 * @function
 * @param {String} cmd a valid shell command
 * @returns {String} raw output of the shell command
 * @throws {Error} On reject, Error object with error message and 
 * exit code of the last command that was executed in the shell
 */
export async function shell(cmd) {
    let ret = ''
    try {
        let shellCommand = cmd
        if (process.env.HOOT_REPO) {
            shellCommand = `ssh root@hootnas '${cmd}'`
        }
        console.log(`shellCommand: ${shellCommand}`)
        const shell = spawn(`${shellCommand}`, { shell: '/bin/bash' })
        for await (const chunk of shell.stderr) {
            ret += chunk
        }
        for await (const chunk of shell.stdout) {
            ret += chunk
        }
        // get exit code of last shell command 
        await new Promise((resolve, reject) => {
            shell.on('exit', (exitCode) => {
                if (exitCode === 0) resolve()
                // a friendly reminder in case webserver is in dev mode i.e. 
                // HOOT_REPO is set, but the user has not setup 
                // ssh access to the remote system
                if (ret.match(/ssh_askpass/i)) {
                    ret = "host key verification failed. please see \n" +
                    '/documentation/create-hootnas-instance.md for more information.'
                }
                const err = new Error(ret)
                err.exit = exitCode 
                reject(err)
            })
        })
    } catch (e) {
        throw e
    }
    return ret
}


/**
 * test the function shell(cmd)
 */
// shell('ls /run/live/persistence')
//     .then((data) => {
//         console.log(`THEN: ${data}`)
//     }
//     ).catch((err) => {
//         console.log(`CATCH:`)
//         console.log(`'${err.message}'`)
//         console.log(err.exit)
        
//     }
//     )


