const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const Path = require('path')

// Handlers

const handler404 = async (req, res) => {
    return res.response(RES_TYPES[404]("You are lost!"));
} 

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/admin.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/icons/{param*}',
        handler: {
            directory: {
                path: './icons/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/files/{param*}',
        handler: {
            directory: {
                path: './files/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/tickets/{param*}',
        handler: {
            directory: {
                path: './tickets/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/images/{param*}',
        handler: {
            directory: {
                path: './images/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/sounds/{param*}',
        handler: {
            directory: {
                path: './sounds/',
                redirectToSlash: true,
                index: true,
            }
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/live-queue/{id}',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/live_queue.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/booth/{id}',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/booth.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/registration/{id}',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/counter.html'))
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/tts',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/tts.html'))
        }
    },
    {
        method: [FETCH_REQUEST_TYPES.GET, FETCH_REQUEST_TYPES.POST, FETCH_REQUEST_TYPES.PUT, FETCH_REQUEST_TYPES.DELETE],
        path: '/{any*}',
        handler: handler404,
    }
]

module.exports = routes