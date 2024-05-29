const { FETCH_REQUEST_TYPES } = require('../../types')
const { generateQr } = require('../../utils')
const Path = require('path')

// Handlers

const handler404 = async (req, res) => {
    return res.response({
        statusCode: 404,
        message: "Where do you want to go, it seems you are lost, come back to the right path, okay 🙃",
        error: "You are lost!"
    })
} 

const handlerIndex = async (req, res) => {
    return res.response({ msg: "You are busted!"})
}

const handlerTestQR = async (req, res) => {
    generateQr("Hello World")
    return res.response({ msg: "Create QR!"})
}

// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/testqr',
        handler: handlerTestQR,
        options: {
            auth: false
        }
    },
    {
        method: FETCH_REQUEST_TYPES.GET,
        path: '/',
        handler: handlerIndex,
        options: {
            auth: false
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
        options: {
            auth: false
        }
    }
]

module.exports = routes