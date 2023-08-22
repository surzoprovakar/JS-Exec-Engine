// const express = require('express')
// const bodyParser = require('body-parser')

// const app = express()
// app.use(bodyParser.json())

function add(a, b) {
  return a + b
}

function sub(a, b) {
  if (a > b) return a - b
  else return b - a
}

// // RPC endpoint
// app.post('/rpc', (req, res) => {
//   const { method, params } = req.body

//   if (method === 'add') {
//     const [a, b] = params
//     const result = add(a, b)
//     res.json(result)
//   } else if (method === 'sub') {
//     const [a, b] = params
//     const result = sub(a, b)
//     res.json(result)
//   }
//   else {
//     res.status(400).json({ error: 'Unknown method' })
//   }
// })

// const PORT = 4000
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
// })


function performRPC(socket) {
  socket.on('data', data => {
    try {
      const requestData = JSON.parse(data)
      const { method, params } = requestData

      if (method === 'add') {
        const [a, b] = params
        const result = add(a, b)
        // socket.write(JSON.stringify(result))
      } else if (method === 'sub') {
        const [a, b] = params
        const result = sub(a, b)
        // socket.write(JSON.stringify(result))
      }
      else {
        socket.write(JSON.stringify({ error: 'Unknown method' }))
      }
    } catch (error) {
      socket.write(JSON.stringify({ error: 'Invalid JSON data' }))
    }
  })

  socket.on('end', () => {
    console.log('Client disconnected')
  })
}

const net = require('net')

const server = net.createServer()
server.on('connection', performRPC)
/*const server = net.createServer(socket => {
  // console.log('Client connected')

  socket.on('data', data => {
    try {
      const requestData = JSON.parse(data)
      const { method, params } = requestData

      if (method === 'add') {
        const [a, b] = params
        const result = add(a, b)
        socket.write(JSON.stringify(result))
      } else if (method === 'sub') {
        const [a, b] = params
        const result = sub(a, b)
        socket.write(JSON.stringify(result))
      }
      else {
        socket.write(JSON.stringify({ error: 'Unknown method' }))
      }
    } catch (error) {
      socket.write(JSON.stringify({ error: 'Invalid JSON data' }))
    }
  })

  socket.on('end', () => {
    console.log('Client disconnected')
  })
})*/

const PORT = 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
