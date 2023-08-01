const net = require('net')
const fs = require('fs')
var Counter = require('./counter')

const defaultPort = 3000
const id = parseInt(process.argv[2])
const ip_address = process.argv[3] || 'localhost'
const AddressesFile = process.argv[4]
const ActionsFile = process.argv[5]

const hosts = fs.readFileSync(AddressesFile, 'utf8', 'r').trim().split('\n')
const actions = fs.readFileSync(ActionsFile, 'utf8', 'r').trim().split('\n')

const counter = new Counter(id)

function sleep(milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
        currentDate = Date.now()
    } while (currentDate - date < milliseconds)
}

function establishConnections() {
    const server = net.createServer()

    server.on('connection', socket => {
        console.log('Client connected.')

        socket.on('data', data => {
            let buffer = Buffer.alloc(12)
            data.copy(buffer)
            const tempCounter = counter.fromByteArray(buffer)
            counter.merge(tempCounter)
        })

        socket.on('end', () => {
            console.log('Client disconnected.')
        })

        socket.on('error', error => {
            console.error('Error:', error.message)
        })
    })

    server.listen(defaultPort, ip_address, () => {
        console.log(`Server is running on ${ip_address}:${defaultPort}`)
    })
}

function broadcast(msg) {
    const client = net.createConnection({ port: defaultPort }, () => {
        console.log('Connected to server.')
        client.write(msg)
    })

    client.on('data', data => {
        console.log('Server response:', data.toString())
    })

    client.on('end', () => {
        console.log('Disconnected from server.')
    })

    client.on('error', error => {
        console.error('Error:', error.message)
    })
}

function do_actions(actions) {
    console.log("Starting to do_actions")
    sleep(5000)

    for (const action of actions) {
        if (action === "Inc") {
            counter.inc()
            console.log(counter.print())
        } else if (action === "Dec") {
            counter.dec()
            console.log(counter.print())
        } else if (action === "Broadcast") {
            console.log("Processing Broadcast")
            if (hosts.length > 0) {
                establishConnections()
            }
            console.log(`About to broadcast ${counter.print()}`)
            broadcast(counter.toByteArray())
        } else {
            const number = parseInt(action)
            if (!isNaN(number)) {
                sleep(number * 1000)
                console.log(`Delay of ${number} seconds.`)
            }
        }
    }

}


do_actions(actions)