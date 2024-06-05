const axios = require('axios');
const FormData = require('form-data');

const sendWa = async (ticket_link, phone_number) => {

    const link = "https://api.fonnte.com/send"
    const token = ["SVPEWKZo_CzuXdU_VuN2"]
    let sent = false

    const body = new FormData();
    body.append("target", phone_number)
    body.append("message", `Hai, berikut digital tiket antrian layanan paspor anda, terima kasih.`)
    body.append("url", ticket_link)
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