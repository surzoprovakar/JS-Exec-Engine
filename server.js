const net = require('net')
const fs = require('fs').promises
var Counter = require('./counter')

const { establishConnections, broadcast } = require('./client')

let hosts = []
let counter
let conns

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

    server.on('connection', handleConnection)

    server.listen({ host: address, port: port })

    await doActions(actions)
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