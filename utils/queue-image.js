const Jimp = require('jimp');
const Path = require('path');
const { generateRandomString } = require('./qr');

const generateQueueImage = async (queue) => {

    try {

        let id = generateRandomString(10);
        const image = await Jimp.read(Path.join(__dirname, '../public/images/bg-ticket-2.png'));
        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
        let outputPath = Path.join(__dirname, `../public/tickets/${id}.png`)
        
        image.print(
            font,
            285, 
            815,
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