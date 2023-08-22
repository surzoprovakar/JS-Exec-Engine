const net = require('net')

function performRPC(port, method, a, b, callback) {
  const requestData = JSON.stringify({
    method: method,
    params: [a, b]
  })

  const client = new net.Socket()

  client.connect(port, 'localhost', () => {
    client.write(requestData)
  })

  client.on('data', data => {
    const response = JSON.parse(data.toString());
    callback(response)
    // client.destroy() // Close the connection after receiving the response
  });

  client.on('close', () => {
    console.log('Connection closed')
  });
}

for (let i = 0; i < 5; i++) {
  const method = i % 2 === 0 ? 'add' : 'sub'

  performRPC(3000, method, i, i + 1, result => {
    console.log('Result:', result)
  })
}