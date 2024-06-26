const { FETCH_REQUEST_TYPES, RES_TYPES } = require('../../types')
const Path = require('path')

// Handlers

const handler404 = async (req, res) => {
    return res.response(RES_TYPES[404]("You are lost!"));
} 

const handlerIndex = async (req, res) => {
    return res.response({ msg: "You are busted!"})
}

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/',
        handler: handlerIndex,
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
        path: '/liveQueue/{id}',
        handler: (h, r) => {
            return r.file(Path.join(__dirname, '../../public/files/liveQueue.html'))
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