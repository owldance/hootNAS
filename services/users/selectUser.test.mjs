'use strict'
import { selectUser } from "./selectUser.mjs"

const user = await selectUser('OneTimeUser','Zn05z1mfk7y')
console.log(JSON.stringify(user))