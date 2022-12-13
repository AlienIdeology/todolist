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
        // take care of date format
        for (let item of rows) {
            item.overdue = false;
            if (!item.remindDate) continue;

            // set overdue
            if (item.remindDate.getTime() < Date.now()) {
                item.overdue = true;
            }
            // change date to string as value of html input-date
            item.remindDate = item.remindDate.toISOString().substring(0, 10);
        }
        let pug = makePugEnv();
        pug.rows = rows;
        res.render("todolist", pug);
    }, err => {
        console.log(err);
        res.render("todolist", makeErrorPugEnv(`Unable to retrieve the todolist. (Reason: ${err.code})`));
    })
});

server.get("/*", (req, res) => {
    res.redirect("/");
});

// sends status code 404 if request resulted in error
server.post("/addTodoItem", (req, res) => {
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

const listener = server.listen(PORT, function(err) {
    console.log(`Listening on http://localhost:${listener.address().port}`);
});
