const axios = require('axios');

const sendWa = async (body) => {

    const link = "https://api.fonnte.com/send"
    const token = ["J#nZjAf57meAH9QQF!Fe"]

    return await axios.post(link, body, {
        headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form' 
        },
        mode: 'cors'
    })
}

module.exports = {
    sendWa
}