const express = require("express");
const db = require("./db");
const server = express();
const PORT = 0;  // auto choose address
server.set("view engine", "pug");
server.set("views", "templates");
server.use(express.json());
server.use(express.urlencoded({extended:true}));

// handle routing
server.use("/resources", express.static("resources"));

server.get("/", (req, res) => {
    res.render("todolist");
});

// api end points
// get a list of items in json format
server.get("/api/items", (req, res) => {
    db.getTodoList(req.query).then(rows => {
        res.json(rows);
    }, err => {
        res.status(500).send(err);
    })
});

// sends status code 404 if request resulted in error
server.post("/api/items/add", (req, res) => {
    console.log(req.body);
    let item = req.body.item;
    if (!item) {
        res.status(400).json({code:"Item (json) needed"});
        return;
    }
    db.addTodoItem(item).then(result => {
        console.log("item successfully added: ");
        console.log(item);
        res.json(result);
    }, err => {
        res.status(500).send(err);
    })
});

server.post("/api/items/update/:id", (req, res) => {
    let item = req.body.item;
    let id = req.params.id;
    if (!item || !id) {
        res.status(400).json({code:"Item (json) or item id needed"});
        return;
    }
    db.updateTodoItem(id, item).then(result => {
        console.log("item successfully updated: ");
        console.log(item);
        res.json(result);
    }, err => {
        res.status(500).send(err);
    })
});

// redirect any other page to the main page
server.get("/*", (req, res) => {
    res.redirect("/");
});

const listener = server.listen(PORT, function(err) {
    console.log(`Listening on http://localhost:${listener.address().port}`);
});
