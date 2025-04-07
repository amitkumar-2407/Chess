const server = io();


// server.emit("hii");

// server.on("hello", function(){
//     console.log("Data aa gaya");
// });

const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = (function(){
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach(function(row, rowindex){
        row.forEach(function(square, squareindex){
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;
            
            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color; 

                pieceElement.addEventListener("dragstart", function(elem){
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowindex, col: squareindex};
                        elem.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", function(dets){
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function(elem){
                elem.preventDefault();
            });

            squareElement.addEventListener("drop", function(dets){
                dets.preventDefault();

                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
});


const handleMove = (function(source, target){
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    }

    server.emit("move", move);
});


const getPieceUnicode = function(piece) {
    const unicodePieces = {
        p: "♙", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
        P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
    };
    return unicodePieces[piece.type] || "";
};


server.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

server.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

server.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});

server.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();  
