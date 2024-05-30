const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const Path = require('path')
const routes = require('../routes')
const socket = require('./socket')

// Hapi configurations
const configHapi = {
    port: process.env.PORT || 7878,
    host: process.env.HOST || "localhost",
    routes: {
        cors: { origin: ['*'] },
        files: {
            relativeTo: Path.join(__dirname, '../public')
        }
    },
    router: {
        stripTrailingSlash: true
    },
}

const server = async () => {

    // Apply configurations
    const app = Hapi.server(configHapi)
    await app.register(Inert)
    app.route(routes)

    // Start services
    await app
        .start()
        .then(() => console.log(`[APP]: Service available on ${app.info.uri}, lets rock n roll ...`))
        .catch((err) => console.log(`Service failed to start... \n ${err}`))
    
    socket.listenSocket(app);
}

module.exports = server