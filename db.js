// Obtain database info and password
const private = require("./private.json");
const mysql = require("mysql");
const server = mysql.createPool({
    host: private.database.host,
    database: private.database.database,
    user: private.database.user,
    password: private.database.password,
    connectionLimit: 5
});
const tableName = private.database.tableName;
exports.server = server;

// build a query string and an array of values to be inserted
function buildQueryString(selector, options) {
    let keys = Object.keys(options);
    let cond = "";
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        cond += keys[i] + "= ?";
        if (i != keys.length-1) {
            cond += " AND ";
        }
        arr.push(options[keys[i]]);
    }
    if (cond.length != 0) cond = " WHERE " + cond + ";";
    return {queryString: `SELECT ${selector} FROM ${tableName}${cond}`,
        values: arr};
}

async function getTodoList(options) {
    return new Promise((resolve, reject) => {
        let res = buildQueryString("*", options);
        server.query(res.queryString, res.values, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}
exports.getTodoList = getTodoList;

async function addTodoItem(item) {
    let keys = Object.keys(item);
    let colList = "";
    let insertStr = "";
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == "id") continue;  // ignore item id so id is auto-incremented
        colList += keys[i] + ",";
        insertStr += "?,";
        arr.push(item[keys[i]]);
    }
    // delete the last ","
    colList = colList.substring(0, colList.length-1);
    insertStr = insertStr.substring(0, insertStr.length-1);

    return new Promise((resolve, reject) => {
        server.query(`INSERT INTO ${tableName} (${colList}) VALUES (${insertStr});`, 
            arr,
            (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}
exports.addTodoItem = addTodoItem;

async function updateTodoItem(id, item) {
    let keys = Object.keys(item);
    let colList = "";
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == "id") continue;  // ignore item id so id is unchanged
        colList += keys[i] + "=?,";
        arr.push(item[keys[i]]);
    }
    // delete the last ","
    colList = colList.substring(0, colList.length-1);

    arr.push(id);
    return new Promise((resolve, reject) => {
        server.query(`UPDATE ${tableName} SET ${colList} WHERE id=?;`,
            arr, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}
exports.updateTodoItem = updateTodoItem;

async function deleteTodoItem(id) {
    return new Promise((resolve, reject) => {
        server.query(`DELETE FROM ${tableName} WHERE id=?;`,
            [id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}
exports.deleteTodoItem = deleteTodoItem;