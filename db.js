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
        colList += keys[i];
        insertStr += "?";
        if (i != keys.length-1) {
            colList += ",";
            insertStr += ",";
        }
        arr.push(item[keys[i]]);
    }

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

async function updateTodoItem(id, columns) {
    let keys = Object.keys(columns);
    let colList = "";
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        colList += keys[i];
        if (i != keys.length-1) {
            colList += "=?,";
        }
        arr.push(columns[keys[i]]);
    }

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