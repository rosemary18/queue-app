const conf = require('./api.config')
const FormData = require('form-data');
const { FETCH_REQUEST_TYPES } = require('../../types')
const abs_path = conf.base_path + '/signin'

// Handlers

const handlerSignEventCounter = async (req, res) => {

    return res.response({
        statusCode: 200,
        message: "Trying sending whatsapp message",
    })
} 

const handlerSignEventBooth = async (req, res) => {

    return res.response({
        statusCode: 200,
        message: "Trying sending whatsapp message",
    })
} 


// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path+'/counter',
        handler: handlerSignEventCounter
    },
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path+'/booth',
        handler: handlerSignEventBooth
    }
]

module.exports = routes