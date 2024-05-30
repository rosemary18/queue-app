const routes = [
    ...require('./other.routes'),
    ...require('./auth.routes'),
    ...require('./event.routes'),
    ...require('./participant.routes'),
    ...require('./queue.routes'),
]

module.exports = routes