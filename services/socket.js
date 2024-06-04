const SocketIO = require('socket.io');
const db = require('./db');

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

        socket.on('call', (data) => {
            SIO.emit('call', data);
        });

        socket.on('disconnect', () => {
            console.log(`[SOCKET]: A user disconnected with ID ${socket.id}!`);
            socket_connections.delete(socket.id);

            let sql_booth_check_socket_id = `SELECT * FROM tbl_booths WHERE socket_id = '${socket.id}'`;
            db.get(sql_booth_check_socket_id, (err, row) => {
                if (err || !row) {
                    let sql_counter_check_socket_id = `SELECT * FROM tbl_counters WHERE socket_id = '${socket.id}'`;
                    db.get(sql_counter_check_socket_id, (err, row) => {
                        if (err) console.error(err.message);
                        else if (row) {
                            let sql_update_socket_id = `UPDATE tbl_counters SET status = 0, socket_id = '' WHERE id = '${row.id}'`;
                            db.run(sql_update_socket_id, (err) => {
                                if (err) console.error(err.message);
                                else {
                                    socket.emit('event-updated');
                                    console.log(`[DATABASE]: Reset socket id for counter ${row?.counter_code}`);
                                }
                            });
                        }
                    });
                } else {
                    let sql_update_socket_id = `UPDATE tbl_booths SET status = 0, socket_id = '' WHERE id = '${row.id}'`;
                    db.run(sql_update_socket_id, (err) => {
                        if (err) console.error(err.message);
                        else {
                            socket.emit('event-updated');
                            console.log(`[DATABASE]: Reset socket id for booth ${row?.booth_code}`);
                        }
                    });
                }
            })
        });

    });

    module.exports.io = SIO
}

module.exports = {
    listenSocket,
    socket_connections,
    emit
}