const Jimp = require('jimp');
const Path = require('path');
const { generateRandomString } = require('./qr');

const generateQueueImage = async (queue) => {

    try {

        let id = generateRandomString(10);
        const image = await Jimp.read(Path.join(__dirname, '../public/images/bg-ticket.png'));
        const font = await Jimp.loadFont(Path.join(__dirname, '../public/fonts/RobotoMono.fnt'));
        let outputPath = Path.join(__dirname, `../public/tickets/${id}.png`)
        
        image.print(
            font,
            185, 
            716,
            queue.toString()
        );

        await image.writeAsync(outputPath);
        return id

    } catch (error) {
        console.error('[ERROR]: Generating queue image:', error);
        return null;
    }
};

module.exports = generateQueueImage