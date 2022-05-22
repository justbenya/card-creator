const PDFDocument = require('pdfkit');
const fs = require('fs');
const {fetchLocalImage} = require('./read');

function generatePDF(deck, settings) {
    const {
        cardCols, cardRows, pageWidth, pageHeight, pageOrientation,
        cardWidth, cardHeight, cardMargin,
        lineWidthThin, lineWidthThick, lineColor,
    } = settings;

    const doc = new PDFDocument({
        autoFirstPage: false,
    });

    let currentCardName, currentCardIndex = 0;

    const flatDeck = [];
    Object.keys(deck).forEach(name => {
        for (let i = 0; i < deck[name]; i++) {
            flatDeck.push(name);
        }
    });

    function addPage(addNew, cards) {
        console.log('Page: ', cards);

        doc.addPage({
            size: [pageWidth, pageHeight],
            layout: pageOrientation,
            margins: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            },
        });

        const vertMargin = (doc.page.height - (cardRows * (cardHeight + cardMargin))) / 2;
        const horMargin = (doc.page.width - (cardCols * (cardWidth + cardMargin))) / 2;

        doc.fillColor(lineColor);
        doc.strokeColor(lineColor);

        for (let col = 0; col <= cardCols; col++) {
            let cardX = horMargin + col * (cardWidth + cardMargin);
            if (col === 0) cardX += cardMargin / 2;
            if (col === cardCols) cardX -= cardMargin / 2;

            doc.lineWidth(lineWidthThin);
            doc.moveTo(cardX, 0).lineTo(cardX, doc.page.height).stroke();

            doc.lineWidth(lineWidthThick);
            doc.moveTo(cardX, vertMargin).lineTo(cardX, doc.page.height - vertMargin).stroke();
        }

        for (let row = 0; row <= cardRows; row++) {
            let cardY = vertMargin + row * (cardHeight + cardMargin);
            if (row === 0) cardY += cardMargin / 2;
            if (row === cardRows) cardY -= cardMargin / 2;

            doc.lineWidth(lineWidthThin);
            doc.moveTo(0, cardY).lineTo(doc.page.width, cardY).stroke();

            doc.lineWidth(lineWidthThick);
            doc.moveTo(horMargin, cardY).lineTo(doc.page.width - horMargin, cardY).stroke();
        }

        for (let col = 0; col < cardCols; col++) {
            for (let row = 0; row < cardRows; row++) {
                currentCardName = flatDeck[currentCardIndex];

                if (!currentCardName) break;

                console.log(col + ',' + row + ' : ' + currentCardName);

                const cardX = horMargin + col * (cardWidth + cardMargin) + cardMargin / 2;
                const cardY = vertMargin + row * (cardHeight + cardMargin) + cardMargin / 2;

                fetchLocalImage(currentCardName, function (err, filename) {
                    if (filename) {
                        doc.image(filename, cardX, cardY, {width: cardWidth, height: cardHeight});
                    } else {
                        console.error('Warning: \'' + currentCardName + '\' is not found!');
                    }
                });

                const VERT_CORNER = 10;
                const CORNER_CURVE = 10;
                const HOR_CORNER = VERT_CORNER;

                function drawCorner(x, y, dx, dy) {
                    doc.lineWidth(lineWidthThin);

                    doc.moveTo(x, y)
                        .lineTo(x, y + dy * VERT_CORNER)
                        .quadraticCurveTo(x + dx * (HOR_CORNER - CORNER_CURVE), y + dy * (VERT_CORNER - CORNER_CURVE), x + dx * HOR_CORNER, y)
                        .lineTo(x, y).fillAndStroke(lineColor);

                }

                drawCorner(cardX, cardY, 1, 1);
                drawCorner(cardX, cardY + cardHeight, 1, -1);
                drawCorner(cardX + cardWidth, cardY, -1, 1);
                drawCorner(cardX + cardWidth, cardY + cardHeight, -1, -1);

                currentCardIndex++;
            }

            if (!currentCardName) break;
        }
    }

    const chunk = cardCols * cardRows;
    for (let i = 0, j = flatDeck.length; i < j; i += chunk) {
        const pageCards = flatDeck.slice(i, i + chunk);
        addPage(i > 0, pageCards, null);
    }

    doc.pipe(fs.createWriteStream('output.pdf'));
    doc.end();
}


module.exports = generatePDF;
