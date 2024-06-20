const axios = require('axios');
const FormData = require('form-data');
const token = [
    "3QeH@JUE5bamR+XocioD",
    "SVPEWKZo_CzuXdU_VuN2",
]
let activeToken = {
    index: 0,
    times: 0
}

const sendWa = async (ticket_link, phone_number) => {

    if (activeToken.times > 10) {
        activeToken.index = activeToken.index == 0 ? 1 : 0
        activeToken.times = 0
    } else activeToken.times += 1

    const link = "https://api.fonnte.com/send"
    let sent = false

    const body = new FormData();
    body.append("target", phone_number)
    body.append("message", `Hallo *SAHABAT MIDO*, selamat datang di *IMIFEST 2024*, dan ini adalah digital tiket antrian layanan paspor kamu, Terima Kasih 🙏🏻`)
    body.append("url", ticket_link)
    body.append("schedule", "0")
    body.append("delay", "2")

    await axios.post(link, body, {
        headers: {
            'Authorization': token[activeToken.index],
            'Content-Type': 'multipart/form' 
        },
        mode: 'cors'
    }).then(response => {
        if (response?.data?.status) sent = true
        else {
            activeToken.index = activeToken.index == 0 ? 1 : 0
            activeToken.times = 0
        }
    })

    return sent
}


module.exports = sendWa