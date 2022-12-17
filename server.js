const express = require("express");
const session = require("express-session");
const db = require("./db");
// load local json data
const private = require("./private.json");
const themes = require("./themes.json");

const server = express();
const PORT = 0;  // auto choose address
// set up express server
server.set("view engine", "pug");
server.set("views", "templates");
server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.use(session({secret:private.session.secret}))

// MIME types
const mime = {
    html: "text/html",
    json: "application/json"
}

// handle routing
server.use("/resources", express.static("resources"));

server.get("/", (req, res) => {
    if (!req.session.theme) req.session.theme = themes[0];  // theme index
    db.getTodoList(req.query).then(rows => {
        res.status(200).type(mime.html).render("todolist", {rows: rows, theme: req.session.theme});
    }, err => {
        console.log("Front page error");
        console.log(err);
        res.status(500).type(mime.html).render("error", {errorMsg: err.code, theme: req.session.theme});
    })
});

// api end points
// get a list of themes
server.get("/api/themes", (req, res) => {
    res.type(mime.json).json(themes);
});

// update the session with the theme
server.put("/api/themes/:name", (req, res) => {
    const name = req.params.name;
    req.session.theme = name ? name : themes[0];
    res.status(200).end();
});

// get a list of items in json format
server.get("/api/items", (req, res) => {
    db.getTodoList(req.query).then(rows => {
        res.type(mime.json).json(rows);
    }, err => {
        console.log("Get items error:");
        console.log(err);
        res.status(500).type(mime.json).json(err);
    })
});

// add item
// sends status code 404 if request resulted in error
server.post("/api/items", (req, res) => {
    let item = req.body;
    if (!item) {
        res.status(400).type(mime.json).json({code:"Item (json) needed"});
        return;
    }
    db.addTodoItem(item).then(result => {
        console.log("Item successfully added: ");
        console.log(item);
        res.type(mime.json).json(result);
    }, err => {
        console.log("Add items error:");
        console.log(err);
        res.status(500).type(mime.json).json(err);
    })
});

// update item
server.put("/api/items/:id", (req, res) => {
    let item = req.body;
    let id = req.params.id;
    if (!item || !id) {
        res.status(400).type(mime.json).json({code:"Item (json) or item id needed"});
        return;
    }
    db.updateTodoItem(id, item).then(result => {
        console.log("Item successfully updated: ");
        console.log(item);
        res.type(mime.json).json(result);
    }, err => {
        console.log("Update items error:");
        console.log(err);
        res.status(500).type(mime.json).json(err);
    })
});

// delete item
server.delete("/api/items/:id", (req, res) => {
    const id = req.params.id;
    db.deleteTodoItem(id).then(result => {
        console.log("Item successfully deleted: ");
        console.log(result);
        res.type(mime.json).json(result);
    }, err => {
        console.log("Update items error:");
        console.log(err);
        res.status(500).type(mime.json).json(err);
    })
});

// redirect any other page to the main page
server.get("/*", (req, res) => {
    res.redirect("/");
});

const listener = server.listen(PORT, function(err) {
    console.log(`Listening on http://localhost:${listener.address().port}`);
});
