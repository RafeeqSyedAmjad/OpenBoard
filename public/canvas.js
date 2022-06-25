

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let pencilColor  = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".Download");
let redo  = document.querySelector(".Redo");
let undo = document.querySelector(".Undo");


let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker  = []; // Data  
let track = 0; // Reperesent which action from tracker array


let mouseDown = false;

// // explanation of canvas
// tool.beginPath(); // to create new path or new graphic
// tool.moveTo(10,10); // start point 
// tool.lineTo(100,150); // end point
// tool.stroke(); // to fill the color in invisible line or to fill graphic


// tool.lineTo(200 , 250);  
// tool.stroke();


// API
let tool = canvas.getContext("2d"); // to draw graphics

tool.strokeStyle = penColor;
tool.lineWidth = penWidth; // here teh value is 3 because in pencil container we gave value 3 for default

//mousedown -> start new path , mousemove -> path fill (graphics)
canvas.addEventListener("mousedown" , (e) => {
    mouseDown = true;
    // beginPath({
    //     x : e.clientX,
    //     y : e.clientY
    // });
    let data = {
        x: e.clientX,
        y : e.clientY
    }
    socket.emit("beginPath" , data);                  // this is used to send your data to server
})
canvas.addEventListener("mousemove" , (e) => {
    if(mouseDown){
        let data = {
            x: e.clientX,
            y: e.clientY,
            color : eraserFlag ? eraserColor : penColor,
            width : eraserFlag  ? eraserWidth : penWidth
        }
        socket.emit("drawStroke",data);
        // drawStroke({
        //     x: e.clientX,
        //     y: e.clientY,
        //     color : eraserFlag ? eraserColor : penColor,
        //     width : eraserFlag  ? eraserWidth : penWidth
        // });
    }
})
canvas.addEventListener("mouseup" , (e) => {
    mouseDown = false;
    
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

undo.addEventListener("click" , (e) => {
    if (track > 0) track--; 
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo",data);
    // undoRedoCanvas(trackObj);

})

redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length-1) track++;
    //track  action

    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redoUndo", data);

    // undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); // new image refrence element
    img.src = url;
    img.onload  = (e) => {
        tool.drawImage(img , 0 , 0 , canvas.width , canvas.height); 
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x , strokeObj.y);
}
function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}


pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;

    })
})

pencilWidthElem.addEventListener("change" , (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;

})

eraser.addEventListener("click" , (e) => {
    if(eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }
    else { 
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click" , (e) => {
   // Get url 
   let url = canvas.toDataURL();


    // method we use to downlaod;
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath" , (data) => {
    // data -> data from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    // data -> data from server
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    // data -> data from server
    undoRedoCanvas(data);
})