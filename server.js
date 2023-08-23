const net = require('net')
const fs = require('fs').promises
const fs2 = require('fs')
var Counter = require('./counter')

const { establishConnections, broadcast } = require('./client')

let hosts = []
let counter
let conns

function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000)
    while (new Date().getTime() <= e) { }
}

function formatDateTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`
}

function writeLog(date, event) {
    var fileName = "Logs/sample.log"
    if (!fs2.existsSync("Logs")) {
        fs2.mkdirSync("Logs", { recursive: true })
    }
    fs2.writeFileSync(fileName, date + " " + event, { flag: 'a' })
}

function currentTime() {
    const now = new Date()
    const formattedDateTime = formatDateTime(now)
    return formattedDateTime
}

function eventData(id, opt, type, o_id) {
    if (type === "local") {
        return id + " executes " + opt + "\n"
    } else {
        return id + " receives sync req from " + o_id + "\n"
    }
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

function performRPC(socket) {

    socket.on('data', async data => {
        const buffer = Buffer.alloc(12)
        data.copy(buffer)
        const tempCounter = counter.fromByteArray(buffer)
        if (tempCounter.getId() != 1 && tempCounter.getId() != 2 && tempCounter.getId() != 3) {
            try {
                const requestData = JSON.parse(data)
                const { method } = requestData
                // console.log("method is " + method)

                var time = currentTime()
                var event = eventData(counter.getId(), method, "local", null)

                if (method === 'Inc') {
                    counter.inc()
                    console.log(counter.print())
                    writeLog(time, event)
                    // socket.write(JSON.stringify(result))
                } else if (method === 'Dec') {
                    counter.dec()
                    console.log(counter.print())
                    writeLog(time, event)
                    // socket.write(JSON.stringify(result))
                } else if (method === 'Broadcast') {
                    if (!conns) {
                        conns = await establishConnections(hosts)
                    }
                    console.log(`About to broadcast ${counter.print()}`)
                    writeLog(time, event)
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
            var time = currentTime()
            var event = eventData(counter.getId(), "", "sync", tempCounter.getId())
            writeLog(time, event)
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