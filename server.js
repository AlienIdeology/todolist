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
    db.getTodoList(req.query).then(rows => {
        res.status(200).render("todolist", {rows: rows});
    }, err => {
        console.log("Front page error");
        console.log(err);
        res.status(500).render("error", {errorMsg: err.code});
    })
});

// api end points
// get a list of items in json format
server.get("/api/items", (req, res) => {
    db.getTodoList(req.query).then(rows => {
        res.json(rows);
    }, err => {
        console.log("Get items error:");
        console.log(err);
        res.status(500).send(err);
    })
});

// add item
// sends status code 404 if request resulted in error
server.post("/api/items", (req, res) => {
    let item = req.body;
    if (!item) {
        res.status(400).json({code:"Item (json) needed"});
        return;
    }
    db.addTodoItem(item).then(result => {
        console.log("Item successfully added: ");
        console.log(item);
        res.json(result);
    }, err => {
        console.log("Add items error:");
        console.log(err);
        res.status(500).send(err);
    })
});

// update item
server.put("/api/items/:id", (req, res) => {
    let item = req.body;
    let id = req.params.id;
    if (!item || !id) {
        res.status(400).json({code:"Item (json) or item id needed"});
        return;
    }
    db.updateTodoItem(id, item).then(result => {
        console.log("Item successfully updated: ");
        console.log(item);
        res.json(result);
    }, err => {
        console.log("Update items error:");
        console.log(err);
        res.status(500).send(err);
    })
});

// delete item
server.delete("/api/items/:id", (req, res) => {
    const id = req.params.id;
    db.deleteTodoItem(id).then(result => {
        console.log("Item successfully deleted: ");
        console.log(result);
        res.json(result);
    }, err => {
        console.log("Update items error:");
        console.log(err);
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
