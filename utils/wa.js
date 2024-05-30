const axios = require('axios');
const FormData = require('form-data');

const sendWa = async (ticket_link, queue_code, phone_number) => {

    const link = "https://api.fonnte.com/send"
    const token = ["J#nZjAf57meAH9QQF!Fe"]

    const body = new FormData();
    body.append("target", `62${phone_number.substring(1)}`)
    body.append("message", `Halo, nomor antrian anda dengan kode ${queue_code}.\nTerima kasih.`)
    body.append("url", ticket_link)
    // body.append("filename", "filename.pdf")
    body.append("schedule", "0")
    body.append("delay", "2")
    body.append("countryCode", "62")

    return await axios.post(link, body, {
        headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form' 
        },
        mode: 'cors'
    })
}


module.exports = sendWa