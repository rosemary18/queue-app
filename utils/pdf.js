const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const wrapText = (text, maxWidth, fontSize, pdfFont) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const width = pdfFont.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
        if (width <= maxWidth) {
            currentLine = `${currentLine} ${word}`.trim();
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

const drawTable = (pdfDoc, page, data, startX, startY, rowHeight, columnWidths, font, boldFont, maxRowsPerPage) => {
    let currentY = startY;
    for (let i = 0; i < data.length; i++) {
        if (i > 0 && i % maxRowsPerPage === 0) {
            page = pdfDoc.addPage([595.28, 935.43]);
            currentY = startY;
        }

        const numberOfColumns = data[i].length;
        const currentFont = i === 0 ? boldFont : font;

        // Menggambar garis horizontal
        page.drawLine({
            start: { x: startX, y: currentY },
            end: { x: startX + columnWidths.reduce((a, b) => a + b, 0), y: currentY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Menambahkan teks ke sel
        let currentX = startX;
        for (let j = 0; j < numberOfColumns; j++) {
            const text = data[i][j];
            const lines = wrapText(text, columnWidths[j] - 10, 10, currentFont);

            for (let k = 0; k < lines.length; k++) {
                page.drawText(lines[k], {
                    x: currentX + 5,
                    y: currentY - 15 - (k * 12),
                    size: 10,
                    font: currentFont,
                    color: rgb(0, 0, 0),
                });
            }

            page.drawLine({
                start: { x: currentX, y: currentY },
                end: { x: currentX, y: currentY - rowHeight },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            currentX += columnWidths[j];
        }

        page.drawLine({
            start: { x: currentX, y: currentY },
            end: { x: currentX, y: currentY - rowHeight },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        currentY -= rowHeight;

        // Menggambar garis horizontal untuk baris terakhir
        if (i === data.length - 1 || (i + 1) % maxRowsPerPage === 0) {
            page.drawLine({
                start: { x: startX, y: currentY },
                end: { x: startX + columnWidths.reduce((a, b) => a + b, 0), y: currentY },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
        }
    }
};

const createPDF = async (event_name, participants) => {

    const layout = {
        width: 595.28,
        height: 935.43,
        widthContent: 595.28-100
    }

    // Membuat PDF baru
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([layout.width, layout.height]);

    // Data tabel
    const data = [['No', 'Name', 'Phone Number', "Queue Code"]];

    for (let index = 0; index < participants?.length; index++) {
        const lines = []
        lines.push(`${index + 1}`)
        lines.push(participants[index].name)
        lines.push(participants[index].phone_number)
        lines.push(participants[index].queue_code)
        data.push(lines)
    }

    // Draw title
    page.drawText(`Event: ${event_name}`, {
        x: 50,
        y: layout.height - 50,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    // Spesifikasi tabel
    const startX = 50;
    const startY = layout.height - 65;
    const rowHeight = 20;
    const columnWidths = [30, (layout.widthContent-30) * .5, (layout.widthContent-30) * .3, (layout.widthContent-30) * .2];
    const maxRowsPerPage = Math.floor((startY - 50) / rowHeight);


    // Menggambar tabel
    drawTable(pdfDoc, page, data, startX, startY, rowHeight, columnWidths, font, boldFont, maxRowsPerPage);

    // Konversi PDF ke Buffer
    const pdfBytes = await pdfDoc.save();

    // Mengembalikan buffer PDF
    return pdfBytes
}

module.exports = createPDF