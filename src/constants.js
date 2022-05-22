const LOCAL_IMAGES_DIRS = [
    'images',
];

const LOCAL_IMAGES_EXTENSION = ['jpg', 'jpeg', 'png'];

const INPUT_DECK = 'deck.txt';

const PAGE_SETTINGS = {
    PORTRAIT: {
        CARD_COLS: 3,
        CARD_ROWS: 3,
        PAGE_WIDTH: 612.00,
        PAGE_HEIGHT: 792.00,
        PAGE_ORIENTATION: 'portrait',
    },
    HORIZONTAL: {
        CARD_COLS: 4,
        CARD_ROWS: 2,
        PAGE_WIDTH: 612.00,
        PAGE_HEIGHT: 792.00,
        PAGE_ORIENTATION: 'horizontal',
    },
};

const CARD = {
    WIDTH: 2.5 * 72,
    HEIGHT: 3.5 * 72,
    MARGIN: 1.0,
};

const LINE = {
    LINE_WIDTH_THIN: 0.05,
    LINE_WIDTH_THICK: CARD.MARGIN + 2,
    LINE_COLOR: 'black',
};

module.exports = {
    LOCAL_IMAGES_DIRS,
    LOCAL_IMAGES_EXTENSION,
    INPUT_DECK,
    PAGE_SETTINGS,
    CARD,
    LINE,
};
