const net = require('net');

const defaultPort = 3000;
const address = process.argv[2] || 'localhost';

const server = net.createServer();

server.on('connection', socket => {
  console.log('Client connected.');

  socket.on('data', data => {
    const message = data.toString().trim();
    const modifiedMessage = message.toUpperCase();
    socket.write(`Server says: ${modifiedMessage}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected.');
  });

  socket.on('error', error => {
    console.error('Error:', error.message);
  });
});

server.listen(defaultPort, address, () => {
  console.log(`Server is running on ${address}:${defaultPort}`);
});
