// client.js
const net = require('net');

const client = net.connect({ port: 3000 }, () => {
    console.log('Connected to server');
});

// Handle data received from the server
client.on('data', (data) => {
    console.log('Received from server:', data.toString());
});

// Handle client disconnection
client.on('end', () => {
    console.log('Disconnected from server');
});

// Handle errors
client.on('error', (err) => {
    console.error('Client error:', err);
});

// Read input from the user and send it to the server
// process.stdin.on('data', (data) => {
//     client.write(data);
//     console.log("end")
// });

client.write("hello")