const server = require('./server')
const db = require('./db')

const start = () => {

    // Start listeners
    server()
}

module.exports = {
    start,
    db,
}