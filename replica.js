const net = require('net')
const fs = require('fs')
var Counter = require('./counter')
const { Console } = require('console')

const defaultPort = 3000
const id = parseInt(process.argv[2])
const ip_address = process.argv[3] || 'localhost'
const AddressesFile = process.argv[4]
const ActionsFile = process.argv[5]

const hosts = fs.readFileSync(AddressesFile, 'utf8', 'r').trim().split('\n')
// console.log("\n" + hosts + "\n")
const actions = fs.readFileSync(ActionsFile, 'utf8', 'r').trim().split('\n')

const counter = new Counter(id)

function sleep(milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
        currentDate = Date.now()
    } while (currentDate - date < milliseconds)
}

function startServer() {

    const server = net.createServer()

    server.on('connection', socket => {
        console.log('Client connected.')

        socket.on('data', data => {
            console.log("received data from others")
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
        do_actions(actions)
    })
}

const client = new net.Socket()
var connected = new Map()

hosts.forEach(item => {
    connected.set(item, false)
})

/*
function sendToOthers(message) {
    hosts.forEach(host => {
        console.log("host is " + host)
        console.log()
        if (!connected.get(host)) {
            console.log(`Connecting to ${host}:${defaultPort}...`)
            client.connect(defaultPort, host, () => {
                console.log(`Connected to ${host}:${defaultPort}.`)
                return new Promise((resolve) => setTimeout(resolve, 1000))
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
            client.write(message)
            connected.set(host, true)
        } else {
            client.write(message)
        }
    })
}
*/

function connectToHost(host) {
    if (connected.get(host)) {
        return Promise.resolve()
    }

    console.log(`Connecting to ${host}:${defaultPort}...`)
    return new Promise((resolve, reject) => {
        client.connect(defaultPort, host, () => {
            console.log(`Connected to ${host}:${defaultPort}.`)
            connected.set(host, true)
            resolve()
        })

        client.on('data', data => {
            console.log('Server response:', data.toString())
        })

        client.on('end', () => {
            console.log('Disconnected from server.')
        })

        client.on('error', error => {
            console.error('Error:', error.message)
            reject(error)
        })
    })
}

async function sendToOthers(message) {
    for (const host of hosts) {
        try {
            await connectToHost(host)
            client.write(message)
        } catch (error) {
            console.error('Failed to connect:', error)
        }
    }
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
                console.log(`About to broadcast ${counter.print()}`)
                sendToOthers(counter.toByteArray())
            }
        } else {
            const number = parseInt(action)
            if (!isNaN(number)) {
                sleep(number * 1000)
                // console.log(`Delay of ${number} seconds.`)
            }
        }
    }

}


startServer()
// do_actions(actions)