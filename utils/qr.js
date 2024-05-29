const QRCode = require('qrcode');
const Path = require('path')

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

const qrOptions = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.92,
  margin: 1,
  color: {
    dark: '#000000', 
    light: '#FFFFFF'
  }
};

const generateQr = async (data) => {

  
  try {
    let id = generateRandomString(10);
    const path = Path.join(__dirname, `../public/qr/${id}.png`)
    QRCode.toFile(path, data, qrOptions, (err) => {
      if (err) {
        console.log(err)
        return null;
      }
      return id
    });

  } catch (error) {
    console.error('Error:', error);
    return null;
  }
  
};

module.exports = {
  generateQr,
  generateRandomString
}