// Obtain database info and password
const dbInfo = require("./db_info");
const mysql = require("mysql");
const server = mysql.createPool({
    host: dbInfo.host,
    database: dbInfo.database,
    user: dbInfo.user,
    password: dbInfo.password,
    connectionLimit: 5
});
const dbName = "todolist";
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
    return {queryString: `SELECT ${selector} FROM ${dbName}${cond}`,
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
        server.query(`INSERT INTO ${dbName} (${colList}) VALUES (${insertStr});`, 
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
        server.query(`UPDATE ${dbName} SET ${colList} WHERE id=?;`,
            arr, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        })
    })
}
exports.updateTodoItem = updateTodoItem;