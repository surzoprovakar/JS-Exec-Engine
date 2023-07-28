const net = require('net')
const fs = require('fs')
var Counter = require('./counter')

let conns = [] // Move the conns array declaration to the global scope

function establishConnections(addresses) {
    //   console.log("Establishing connections with " + addresses)

    return addresses.map(address => {
        const [host, port] = address.split(':')
        const conn = net.createConnection({ host, port: parseInt(port) })
        conn.setTimeout(5000)

        conn.on('error', () => {
            console.log(`Error connecting to ${address}`)
            conn.end()
        })

        return conn
    })
}
function broadcast(conns, content) {
    conns.forEach(conn => {
        conn.write(content)
    })
}

function fromByteArray(buffer) {
    const id = buffer.readUInt32LE(0)
    const value = buffer.readInt32LE(4)
    const time = buffer.readUInt32LE(8)

    return new Counter(id, value, time)
}

function do_actions(actions) {

    // Sleep for 10 secs, so other replicas have time to get started
    setTimeout(() => {
        console.log("Starting to do_actions")

        for (const action of actions) {
            if (action === "Inc") {
                counter.inc()
                console.log(counter.print())
            } else if (action === "Dec") {
                counter.dec()
                console.log(counter.print())
            } else if (action === "Broadcast") {
                console.log("Processing Broadcast")
                console.log("Hosts from file:", hosts)
                if (hosts.length > 0) {
                    conns = establishConnections(hosts)
                }
                console.log(`About to broadcast ${counter.print()}`)
                broadcast(conns, counter.toByteArray())
            } else {
                const number = parseInt(action)
                if (!isNaN(number)) {
                    setTimeout(() => {
                        console.log(`Delay of ${number} seconds.`)
                    }, number * 1000)
                }
            }
        }
    }, 10000) // Delay execution to allow other replicas to get started
}



if (process.argv.length !== 6) {
    console.log("Usage: node server.js counter_id ip_address crdt_socket_server Addresses1.txt Actions1.txt")
    process.exit(1)
}
const id = parseInt(process.argv[2])
const ip_address = process.argv[3]
// const crdt_socket_server = process.argv[4]
const Addresses1File = process.argv[4]
// console.log(Addresses1File)
const Actions1File = process.argv[5]

const counter = new Counter(id)
// let conns = []

const connType = 'tcp'
console.log("Starting " + connType + " server on " + ip_address)
const server = net.createServer(conn => {
    let buffer = Buffer.alloc(12)

    conn.on('data', data => {
        data.copy(buffer)
        const tempCounter = fromByteArray(buffer)
        counter.merge(tempCounter)
    })

    conn.on('error', () => {
        console.log("Client left.")
        conn.end()
    })
})

server.on('listening', () => {
    // server.close()
    server.listen(ip_address)
})

const hosts = fs.readFileSync(Addresses1File, 'utf8', 'r').trim().split('\n')
// console.log(hosts)
const actions = fs.readFileSync(Actions1File, 'utf8', 'r').trim().split('\n')
// console.log(actions)

do_actions(actions)
