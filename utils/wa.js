const axios = require('axios');
const FormData = require('form-data');

const sendWa = async (ticket_link, queue_code, phone_number) => {

    const link = "https://api.fonnte.com/send"
    const token = ["SVPEWKZo_CzuXdU_VuN2"]
    let sent = false

    const body = new FormData();
    body.append("target", phone_number)
    body.append("message", `Halo, nomor antrian anda dengan kode ${queue_code}.\nTerima kasih.`)
    body.append("url", ticket_link)
    // body.append("filename", "filename.pdf")
    body.append("schedule", "0")
    body.append("delay", "2")

    await axios.post(link, body, {
        headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form' 
        },
        mode: 'cors'
    }).then(response => {
        if (response?.data?.status) sent = true
    })

    return sent
}


module.exports = sendWa