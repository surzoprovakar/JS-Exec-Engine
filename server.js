const net = require('net')
const fs = require('fs')
var Counter = require('./counter')

let conns = []

function establishConnections(addresses) {
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
    console.log("cons: " + conns)
    conns.forEach(conn => {
        conn.write(content)
    })
}

function do_actions(actions) {
    delay(5000)
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
            // console.log("Hosts from file:", hosts)
            if (hosts.length > 0) {
                conns = establishConnections(hosts)
            }
            console.log(`About to broadcast ${counter.print()}`)
            broadcast(conns, counter.toByteArray())
        } else {
            const number = parseInt(action)
            if (!isNaN(number)) {
                delay(number * 1000)
                console.log(`Delay of ${number} seconds.`)
            }
        }
    }

}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}


if (process.argv.length !== 6) {
    console.log("Usage: node server.js counter_id ip_address crdt_socket_server Addresses1.txt Actions1.txt")
    process.exit(1)
}

const id = parseInt(process.argv[2])
const ip_address = process.argv[3]
const [hst, prt] = ip_address.split(':')
// console.log("host: " + hst)
// console.log("port: " + prt)
// const crdt_socket_server = process.argv[4]
const Addresses1File = process.argv[4]
// console.log(Addresses1File)
const Actions1File = process.argv[5]


const counter = new Counter(id)
// let conns = []
const hosts = fs.readFileSync(Addresses1File, 'utf8', 'r').trim().split('\n')
// console.log(hosts)
const actions = fs.readFileSync(Actions1File, 'utf8', 'r').trim().split('\n')
// console.log(actions)

const connType = 'tcp'
console.log("Starting " + connType + " server on " + ip_address)

const server = net.createServer(conn => {
    console.log("server created")
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
    console.log("server running")
})

server.on('listening', () => {
    const address = server.address()
    console.log(`Server is listening on address ${address.address} and port ${address.port}`)
    // server.close()
    // server.listen(host, port)
})

server.listen(hst, prt, () => {
    // const address = server.address()
    // console.log(`Server is listening on address ${hst} and port ${prt}`)
})

do_actions(actions)
