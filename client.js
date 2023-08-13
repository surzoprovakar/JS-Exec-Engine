const net = require('net')

function establishConnections(addresses) {
    const conns = []
    for (let i = 0; i < addresses.length; i++) {
        console.log(`establishing connection ${addresses[i]}`)
        const [ip, port] = addresses[i].split(":")
        const conn = net.createConnection({ host: ip, port: port })
        conn.on('error', (err) => {
            console.log('Error connecting:', err.message)
            process.exit(1)
        })
        conns.push(conn)
    }

    return conns
}

function broadcast(conns, content) {
    for (let i = 0; i < conns.length; i++) {
        conns[i].write(content, (err) => {
            if (err) {
                console.log('Error socket writing:', err.message)
                process.exit(1)
            }
        })
    }
}

module.exports = { establishConnections, broadcast }