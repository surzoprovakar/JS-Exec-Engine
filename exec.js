const fs = require('fs').promises
const net = require('net')

async function readFile(filename) {
    const content = await fs.readFile(filename, 'utf-8')
    return content.trim().split('\n').map(line => line.split(' ', 2)).filter(parts => parts.length === 2)
}

async function main() {
    const actions = await readFile('script.txt')
    for (const action of actions) {
        console.log(action[0] + " " + action[1])
        performRPC(action[0], action[1])
    }

}

main().catch(error => console.error(error))

function performRPC(port, method) {
    const requestData = JSON.stringify({
        method: method
    })

    const client = new net.Socket()

    client.connect(port, 'localhost', () => {
        client.write(requestData)
    })

    client.on('data', data => {
        const response = JSON.parse(data.toString())
        // callback(response)
        // client.destroy(); // Close the connection after receiving the response
    })

    client.on('close', () => {
        // console.log('Connection closed')
    })
}

// for (let i = 0; i < 5; i++) {
//     const method = i % 2 === 0 ? 'add' : 'sub'

//     performRPC(3000, method, i, i + 1, result => {
//         console.log('Result:', result);
//     });
// }
