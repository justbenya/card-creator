const {readFile} = require('./read');
const {INPUT_DECK, PAGE_SETTINGS, CARD, LINE} = require('./constants');
const generatePDF = require('./generatePDF');

readFile(INPUT_DECK, (err, deck) => {
    console.log(deck);

    generatePDF(deck, {
        cardCols: PAGE_SETTINGS.PORTRAIT.CARD_COLS,
        cardRows: PAGE_SETTINGS.PORTRAIT.CARD_ROWS,
        pageWidth: PAGE_SETTINGS.PORTRAIT.PAGE_WIDTH,
        pageHeight: PAGE_SETTINGS.PORTRAIT.PAGE_HEIGHT,
        pageOrientation: PAGE_SETTINGS.PORTRAIT.PAGE_ORIENTATION,

        cardWidth: CARD.WIDTH,
        cardHeight: CARD.HEIGHT,
        cardMargin: CARD.MARGIN,

        lineWidthThin: LINE.LINE_WIDTH_THIN,
        lineWidthThick: LINE.LINE_WIDTH_THICK,
        lineColor: LINE.LINE_COLOR,
    });
});



