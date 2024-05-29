const conf = require('./api.config')
const FormData = require('form-data');
const { FETCH_REQUEST_TYPES } = require('../../types');
const { sendWa } = require('../../utils');
const abs_path = conf.base_path + '/participant'

// Handlers

const handlerGetAllParticipants = async (req, res) => {
    
    return res.response({
        statusCode: 200,
        message: "Trying sending whatsapp message",
    })
} 

const handlerAddParticipant = async (req, res) => {

    const body = new FormData();

    body.append("target", "6285763793484")
    body.append("message", "kirim dari js")
    body.append("url", "https://md.fonnte.com/images/wa-logo.png")
    // body.append("filename", "filename.pdf")
    // body.append("schedule", "0")
    // body.append("delay", "2")
    // body.append("countryCode", "62")
    // body.append("buttonJSON", '{"message":"fonnte button message","footer":"fonnte footer message","buttons":[{"id":"mybutton1","message":"hello fonnte"},{"id":"mybutton2","message":"fonnte pricing"},{"id":"mybutton3","message":"tutorial fonnte"}]}')
    // body.append("templateJSON", '{"message":"fonnte template message","footer":"fonnte footer message","buttons":[{"message":"fonnte","url":"https://fonnte.com"},{"message":"call me","tel":"6282227097005"},{"id":"mybutton1","message":"hello fonnte"}]}')
    // body.append("listJSON", '{"message":"fonnte list message","footer":"fonnte footer message","buttonTitle":"fonnte\'s packages","title":"fonnte title","buttons":[{"title":"text only","list":[{"message":"regular","footer":"10k messsages/month","id":"list-1"},{"message":"regular pro","footer":"25k messsages/month","id":"list-2"},{"message":"master","footer":"unlimited messsages/month","id":"list-3"}]},{"title":"all feature","list":[{"message":"super","footer":"10k messsages/month","id":"list-4"},{"message":"advanced","footer":"25k messsages/month","id":"list-5"},{"message":"ultra","footer":"unlimited messsages/month","id":"list-6"}]}]}')
    
    await sendWa(body).then(() => {
        return res.response({
            statusCode: 200,
            message: "Whatsapp successfully sent!",
        })
    }).catch((error) => {
        console.error(error);
        return res.response({
            statusCode: 200,
            message: "Whatsapp unsuccessfully sent!",
        })
    });

} 

const handlerResendWhatsApp = async (req, res) => {
    
    return res.response({
        statusCode: 200,
        message: "Trying sending whatsapp message",
    })
} 


// Routing

const routes = [
    {
        method: FETCH_REQUEST_TYPES.POST,
        path: abs_path + '/add',
        handler: handlerAddParticipant
    }
]

module.exports = routes