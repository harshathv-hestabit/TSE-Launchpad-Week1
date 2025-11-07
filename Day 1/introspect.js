/* 
Task 03 - Create introspect.js 
The program must print out the following:
    - OS
    - Architecture
    - CPU cores
    - Total Memory
    - System Uptime
    - Current logged user
    - Node path
*/

const os = require('os')

console.log("Executing Introspect.js")

console.log(`OS: ${os.platform()}`)

console.log(`Architecture: ${os.arch()}`)

console.log(`CPU cores: ${os.availableParallelism()}`)

console.log(`Total Memory: ${os.totalmem()}`)

console.log(`System Uptime: ${os.uptime()}`)

console.log(`Current Logged User: ${os.hostname()}`)

console.log(`Node Path: ${os.version()}`)