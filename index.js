const fs = require('fs');
const byline = require('byline');
const path = require('path');
const PDFDocument = require('pdfkit');

var INPUT_DECK = 'test.txt';
var LOCAL_IMAGES_DIRS = [
    'images'
];
var LOCAL_IMAGES_EXTS = ['jpg', 'jpeg', 'png'];


function readDesk(deskFileName, callback) {

    var stream = byline(fs.createReadStream(deskFileName));
    var result = {};
    stream.on('data', function (buf) {
        var line = buf.toString();
        if (line.match(/Sideboard/gi))
            return;
        var match = line.match(/([0-9]+)[\s\t]+(.*)/);
        if (!match)
            return;


        var cardName = match[2];
        var cardNumber = Number(match[1]);
        if (!result[cardName])
            result[cardName] = 0;
        result[cardName] += cardNumber;
    });
    stream.on('end', function () {
        callback(null, result);
    });

}

function fetchLocalImage(name, callback) {
    var result = null;
    LOCAL_IMAGES_DIRS.forEach(function (localDir) {
        LOCAL_IMAGES_EXTS.forEach(function (ext) {
            var testPath = path.join(localDir, name + '.' + ext);

            if (fs.existsSync(testPath)) { //fixme: sync!
                result = testPath;
            }
        });
    });
    if (!result) {
        console.error('WARNING: \'' + name + '\' not found!');
    }
    callback(null, result);
}

//
// var CARD_COLS = 4;
// var CARD_ROWS = 2;
// var PAGE_WIDTH = 612.00;
// var PAGE_HEIGHT = 792.00;
// var PAGE_ORIENTATION = 'horizontal';

var CARD_COLS = 3;
var CARD_ROWS = 3;
var PAGE_WIDTH = 612.00;
var PAGE_HEIGHT = 792.00;
var PAGE_ORIENTATION = "portrait";

var CARD_WIDTH = 2.5 * 72;
var CARD_HEIGHT = 3.5 * 72;

var CARD_MARGIN = 1.0;
var LINE_WIDTH_THIN = 0.06;
var LINE_WIDTH_THICK = CARD_MARGIN + 2;
var LINE_COLOR = 'black';


function generatePdf(deck, callback) {
    var doc = new PDFDocument({autoFirstPage: false});

    var currentCardName, currentCardIndex = 0;

    var flatDeck = [];
    Object.keys(deck).forEach(function (name) {
        for (let i = 0; i < deck[name]; i++) {
            flatDeck.push(name);
        }
    });

    function addPage(addNew, cards, callback) {
        console.log('Page: ', cards);
        doc.addPage({
            size: [PAGE_WIDTH, PAGE_HEIGHT],
            layout: PAGE_ORIENTATION,
            margins: {
                top: vertMargin,
                bottom: vertMargin,
                left: horMargin,
                right: horMargin
            }
        });
        var vertMargin = (doc.page.height - (CARD_ROWS * (CARD_HEIGHT + CARD_MARGIN))) / 2;
        var horMargin = (doc.page.width - (CARD_COLS * (CARD_WIDTH + CARD_MARGIN))) / 2;

        doc.fillColor(LINE_COLOR);
        doc.strokeColor(LINE_COLOR);
        for (var col = 0; col <= CARD_COLS; col++) {
            var cardX = horMargin + col * (CARD_WIDTH + CARD_MARGIN);
            if (col == 0)
                cardX += CARD_MARGIN / 2;
            if (col == CARD_COLS)
                cardX -= CARD_MARGIN / 2;

            doc.lineWidth(LINE_WIDTH_THIN);
            doc.moveTo(cardX, 0).lineTo(cardX, doc.page.height).stroke();
            doc.lineWidth(LINE_WIDTH_THICK);
            doc.moveTo(cardX, vertMargin).lineTo(cardX, doc.page.height - vertMargin).stroke();
        }

        for (var row = 0; row <= CARD_ROWS; row++) {
            var cardY = vertMargin + row * (CARD_HEIGHT + CARD_MARGIN);
            if (row == 0)
                cardY += CARD_MARGIN / 2;
            if (row == CARD_ROWS)
                cardY -= CARD_MARGIN / 2;

            doc.lineWidth(LINE_WIDTH_THIN);
            doc.moveTo(0, cardY).lineTo(doc.page.width, cardY).stroke();

            doc.lineWidth(LINE_WIDTH_THICK);
            doc.moveTo(horMargin, cardY).lineTo(doc.page.width - horMargin, cardY).stroke();
        }

        for (var col = 0; col < CARD_COLS; col++) {
            for (var row = 0; row < CARD_ROWS; row++) {

                currentCardName = flatDeck[currentCardIndex];
                if (!currentCardName)
                    break;
                console.log(col + ',' + row + ' : ' + currentCardName);
                var cardX = horMargin + col * (CARD_WIDTH + CARD_MARGIN) + CARD_MARGIN / 2;
                var cardY = vertMargin + row * (CARD_HEIGHT + CARD_MARGIN) + CARD_MARGIN / 2;

                fetchLocalImage(currentCardName, function (err, filename) {
                    if (filename)
                        doc.image(filename, cardX, cardY, {width: CARD_WIDTH, height: CARD_HEIGHT});
                    else
                        console.error('WARNING: \'' + currentCardName + '\' is not found!');
                });

                var VERT_CORNER = 10;
                var CORNER_CURVE = 10;
                var HOR_CORNER = VERT_CORNER;

                function drawCorner(x, y, dx, dy) {
                    doc.lineWidth(LINE_WIDTH_THIN);

                    doc.moveTo(x, y)
                        .lineTo(x, y + dy * VERT_CORNER)
                        .quadraticCurveTo(x + dx * (HOR_CORNER - CORNER_CURVE), y + dy * (VERT_CORNER - CORNER_CURVE), x + dx * HOR_CORNER, y)
                        .lineTo(x, y).fillAndStroke(LINE_COLOR);

                }

                drawCorner(cardX, cardY, 1, 1);
                drawCorner(cardX, cardY + CARD_HEIGHT, 1, -1);
                drawCorner(cardX + CARD_WIDTH, cardY, -1, 1);
                drawCorner(cardX + CARD_WIDTH, cardY + CARD_HEIGHT, -1, -1);

                currentCardIndex++;
            }

            if (!currentCardName) break;
        }

    };


    var i, j, chunk = CARD_COLS * CARD_ROWS;
    for (i = 0, j = flatDeck.length; i < j; i += chunk) {
        var pageCards = flatDeck.slice(i, i + chunk);
        addPage(i > 0, pageCards, null);
    }


    doc.pipe(fs.createWriteStream('output.pdf'));
    doc.end();
}

readDesk(INPUT_DECK, function (err, deck) {
    console.log(deck);

    generatePdf(deck, function (err, result) {
        console.log('Generated!');
    });

});



