const { generateQr, generateRandomString } = require('./qr');
const sendWa = require('./wa');
const generateQueueImage = require('./queue-image');

module.exports = {
    generateQr,
    generateRandomString,
    generateQueueImage,
    sendWa
}