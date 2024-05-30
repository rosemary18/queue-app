const SocketIO = require('socket.io');

let SIO = null
let socket_connections = new Map();

const emit = (event, data) => {
    
    console.log(`[SOCKET]: Emitting event ${event}`);
    SIO?.emit(event, data);
}

const listenSocket = (app) => {

    // Apply app to socket
    SIO = SocketIO(app.listener)

    // Listen socket
    SIO.on('connection', (socket) => {

        const clientAddress = socket.handshake.address;
        console.log(`[SOCKET]: A user connected with ID ${socket.id} and IP ${clientAddress}!`);

        // Add socket to connections
        socket_connections.set(socket.id, socket);

        socket.on('message', (msg) => {
            console.log('message: ' + msg);
            SIO.emit('message', msg);
        });

        socket.on('disconnect', () => {
            console.log(`[SOCKET]: A user disconnected with ID ${socket.id}!`);
            socket_connections.delete(socket.id);
        });

    });

    module.exports.io = SIO
}

module.exports = {
    listenSocket,
    socket_connections,
    emit
}