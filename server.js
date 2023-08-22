const net = require('net')
const fs = require('fs').promises
var Counter = require('./counter')

const { establishConnections, broadcast } = require('./client')

let hosts = []
let counter
let conns

function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000)
    while (new Date().getTime() <= e) { }
}

async function doActions(actions) {
    await new Promise(resolve => setTimeout(resolve, 10000)) // Sleep for 10 seconds

    console.log('Starting to do_actions')

    for (const action of actions) {
        if (action === 'Inc') {
            counter.inc()
            console.log(counter.print())
        } else if (action === 'Dec') {
            counter.dec()
            console.log(counter.print())
        } else if (action === 'Broadcast') {
            if (!conns) {
                conns = await establishConnections(hosts)
            }
            console.log(`About to broadcast ${counter.print()}`)
            broadcast(conns, counter.toByteArray())
        } else {
            const number = parseInt(action)
            await new Promise(resolve => setTimeout(resolve, number * 1000))
        }
    }
}

function isByteArray(array) {
    if (array && array.byteLength !== undefined) return true;
    return false;
}

function performRPC(socket) {
    // await new Promise(resolve => setTimeout(resolve, 10000))
    // console.log('Starting to do_actions')

    socket.on('data', async data => {
        // console.log("data is " + JSON.parse(data))
        // console.log(isByteArray(data))
        // console.log(new TextDecoder().decode(data))

        const buffer = Buffer.alloc(12)
        data.copy(buffer)
        // console.log(buffer)
        const tempCounter = counter.fromByteArray(buffer)
        // console.log(tempCounter.print())
        // console.log(typeof(tempCounter.getId()))
        if (tempCounter.getId() != 1 && tempCounter.getId() != 2 && tempCounter.getId() != 3) {
            try {
                const requestData = JSON.parse(data)
                const { method } = requestData
                // console.log("method is " + method)
                if (method === 'Inc') {
                    counter.inc()
                    console.log(counter.print())
                    // socket.write(JSON.stringify(result))
                } else if (method === 'Dec') {
                    counter.dec()
                    console.log(counter.print())
                    // socket.write(JSON.stringify(result))
                } else if (method === 'Broadcast') {
                    if (!conns) {
                        conns = await establishConnections(hosts)
                    }
                    console.log(`About to broadcast ${counter.print()}`)
                    broadcast(conns, counter.toByteArray())
                }
                else if (!isNaN(method)) {
                    // socket.write(JSON.stringify({ error: 'Unknown method' }))
                    const number = parseInt(method)
                    //new Promise(resolve => setTimeout(resolve, number * 1000))
                    sleep(number)
                    console.log("Delay of " + number + " seconds")
                }
            } catch (error) {
                socket.write(JSON.stringify({ error: 'Invalid JSON data' }))
            }
        } else {
            console.log("About to merge")
            counter.merge(tempCounter)
        }
    })

    socket.on('end', () => {
        console.log('Client disconnected')
    })
}

async function main() {
    const input = process.argv.slice(2)
    // console.log(input)
    if (input.length !== 4) {
        console.log('Usage: counter_id ip_address crdt_socket_server Replicas\'_Addresses.txt Actions.txt')
        process.exit(1)
    }

    const id = parseInt(input[0])
    counter = new Counter(id)

    const ipAddress = input[1]
    const [address, port] = ipAddress.split(":")

    hosts = await readFile(input[2])
    const actions = await readFile(input[3])

    console.log(`Starting server on ${address}:${port}`)
    const server = net.createServer()

    server.on('connection', performRPC)
    // server.on('connection', handleConnection)

    server.listen({ host: address, port: port })

    // await doActions(actions)
}

async function readFile(filename) {
    const content = await fs.readFile(filename, 'utf-8')
    return content.trim().split('\n')
}

function handleConnection(conn) {
    const buffer = Buffer.alloc(12)

    conn.on('data', async data => {
        data.copy(buffer)
        const tempCounter = counter.fromByteArray(buffer)

        counter.merge(tempCounter)
    })

    conn.on('close', () => {
        console.log('Client left.')
    })

    conn.on('error', () => {
        console.log('Error connecting.')
    })
}

main().catch(error => console.error(error))