const express = require("express");
const app = express();

const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");


const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentplayer = "w";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    res.render("index");
});

io.on("connection", function(uniquesocket){
    // console.log("connected");

    // uniquesocket.on("hii", function(){
    //     console.log("received");
    //     io.emit("hello");
    // });

    // uniquesocket.on("disconnect", function(){
    //     console.log("disconnected");
    // });

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }


    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move", function(move){
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            
            if(result){
                currentplayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            }
            else{
                console.log("Invalid move : ", move);
                uniquesocket.emit("InvalidMove", move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalid move : ", move);
        }
    })

});

server.listen(3000, function(){
    console.log("The server is running port 3000");
});