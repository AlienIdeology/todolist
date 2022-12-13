const express = require("express");
const db = require("./db");
const server = express();
const PORT = 0;  // auto choose address
server.set("view engine", "pug");
server.set("views", "templates");
server.use(express.urlencoded({extended:true}));

// globals
let lightTheme = true;
function makePugEnv() {
    return {lightTheme: lightTheme};
} 
function makeErrorPugEnv(errorMsg) {
    let pug = makePugEnv();
    pug.error = true;
    pug.errorMsg = errorMsg;
    return pug;
}

// handle routing
server.use("/resources", express.static("resources"));

server.get("/", (req, res) => {
    db.getTodoList(req.query).then(rows => {
        res.render("todolist", makePugEnv());
    }, err => {
        console.log(err);
        res.render("todolist", makeErrorPugEnv(`Unable to retrieve the todolist. (Reason: ${err.code})`));
    })
});

// api end points
// get a list of items in json format
server.get("/api/items", (req, res) => {
    db.getTodoList(req.query).then(rows => {
        res.json(rows);
    }, err => {
        res.status(404).end();
    })
});

// sends status code 404 if request resulted in error
server.post("/api/items/add", (req, res) => {
    let item = req.body.item;
    if (!item) {
        res.status(400).end();
        return;
    }
    db.addTodoItem(item).then(res => {
        console.log("item successfully added: ");
        console.log(item);
    }, err => {
        res.status(404).end();
    })
});

// redirect any other page to the main page
server.get("/*", (req, res) => {
    res.redirect("/");
});

const listener = server.listen(PORT, function(err) {
    console.log(`Listening on http://localhost:${listener.address().port}`);
});
