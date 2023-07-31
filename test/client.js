const net = require('net');

const client = net.createConnection({ port: 3000 }, () => {
  console.log('Connected to server.');

  process.stdin.on('data', data => {
    const message = data.toString().trim();
    client.write(message);
  });
});

client.on('data', data => {
  console.log('Server response:', data.toString());
});

client.on('end', () => {
  console.log('Disconnected from server.');
});

client.on('error', error => {
  console.error('Error:', error.message);
});
