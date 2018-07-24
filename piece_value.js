
let board = {};
class ValueCounter {
    constructor(fen, container) {
        //console.log("stock", fen);
        this.DEPTH = 10;
        let stockfish = new Worker("./node_modules/stockfish/src/stockfish.js");
        stockfish.postMessage("position fen '" + fen + "' ");
        stockfish.postMessage("go depth " + this.DEPTH);
        stockfish.onmessage = function (event) {
            container[0] = event.data ? event.data : event;
            //console.log(event.data ? event.data : event);
        };
    }
}

function getListOfFensWithoutEveryPiece(fen) {
    let fileMap = {1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "f", 7: "g", 8: "h"};
    let fens = {};
    let rank = 8;
    for (let i = 0; i < fen.indexOf(" "); ++i) {
        if (isNaN(fen[i])) {
            if (fen[i] === "/") {
                rank -= 1;
            } else {
                let lastSlash = fen.substring(0, i).lastIndexOf("/");
                lastSlash = lastSlash === -1 ? 0 : lastSlash;
                let file = calculateRank(fen.split("/")[8 - rank], i - lastSlash);
                fens[fileMap[file] + rank] = subtituteOnePiece(fen, i);
            }
        }
    }
    return fens;
}

function calculateRank(fenFile, i) {
    let rank = 0;
    for (let c of fenFile.substring(0, i).split("")) {
        if (!isNaN(c)) {
            rank += parseInt(c)
        } else {
            rank += 1
        }
    }
    return rank;
}

function subtituteOnePiece(fen, index) {
    let isLeftNumber = isNumeric(fen[index - 1]);
    let isRightNumber = isNumeric(fen[index + 1]);
    let leftIndex = isLeftNumber ? index - 1 : index;
    let rightIndex = isRightNumber ? index + 1 : index;
    let left = isLeftNumber ? parseInt(fen[index - 1]) : 0;
    let right = isRightNumber ? parseInt(fen[index + 1]) : 0;
    let leftSub = fen.substring(0, leftIndex);
    let rightSub = fen.substring(rightIndex + 1);
    return leftSub + (left + right + 1) + rightSub;
}

function isNumeric(str) {
    return !isNaN(str);
}

function getPieceValues(fen) {
    let fens = getListOfFensWithoutEveryPiece(fen);
    console.log(fens);
    for (let file of "abcdefgh".split("")) {
        for (let rank of "12345678".split("")) {
            board[file + rank] = [0];
        }
    }
    for (let square of Object.keys(fens)) {
        new ValueCounter(fen, board[square]);
    }
    return board;
}

$.ajax({
    url: "sample.html", success: function (data) {
        let lastFenPositionIndexStart = data.lastIndexOf('"fen": ') + 8;
        let lastFenPositionIndexEnd = data.indexOf('"', lastFenPositionIndexStart);
        let fen = data.substring(lastFenPositionIndexStart, lastFenPositionIndexEnd);
        let initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let someFen = "8/R7/2k5/8/8/7K/8/8 b - - 5 63";
        board = getPieceValues(initialFen);
    }
});
