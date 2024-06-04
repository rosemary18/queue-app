const { generateQr, generateRandomString } = require('./qr');
const sendWa = require('./wa');
const generateQueueImage = require('./queue-image');
const createPDF = require('./pdf')

module.exports = {
    generateQr,
    generateRandomString,
    generateQueueImage,
    sendWa,
    createPDF
}