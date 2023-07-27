const net = require('net')

const clients = []

const server = net.createServer((socket) => {
    console.log('New client connected');

    // Store the client socket in an array
    clients.push(socket);

    // Handle data received from the client
    socket.on('data', (data) => {
        // console.log('Received from client:', data.toString());

        // // Broadcast the message to all other connected clients (except the sender)
        // clients.forEach((client) => {
        //     if (client !== socket && client.writable) {
        //         client.write(data, (err) => {
        //             if (err) {
        //                 console.error('Error writing data to client:', err);
        //             }
        //         });
        //     }
        // });

        const senderIndex = clients.indexOf(socket);
        const receiverIndex = senderIndex === 0 ? 1 : 0;
        const receiver = clients[receiverIndex];

        receiver.write(data)
    });

    // Handle client disconnection
    socket.on('end', () => {
        console.log('Client disconnected');
        // Remove the client socket from the array
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    // Handle errors
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


