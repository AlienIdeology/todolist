let table = [{
    id: 1,
    text: "Finish todolist",
    remindDate: null,
    done: 1
}, {
    id: 2,
    text: "Host todolist",
    remindDate: "2022-12-10",
    done: 1
}, {
    id: 3,
    text: "I probably don't have to do this",
    remindDate: "2060-01-01",
    done: 0
}, {
    id: 4,
    text: "I forgot to do this",
    remindDate: "2022-12-10",
    done: 0
}];

let nextId = table.length+1;

async function getTodoList(options) {
    return new Promise((resolve, reject) => {
        resolve(table);
    })
}
exports.getTodoList = getTodoList;

async function addTodoItem(item) {
    return new Promise((resolve, reject) => {
        item.id = nextId;
        nextId++;
        table.push(item);
        resolve({insertId: item.id});
    })
}
exports.addTodoItem = addTodoItem;

async function updateTodoItem(id, item) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < table.length; i++) {
            if (table[i].id == id) {
                table[i] = item;
                resolve(table);  // doesn't matter what we return here
                return;
            }
        }
        reject({code: "ITEM NOT FOUND"});
    })
}
exports.updateTodoItem = updateTodoItem;

async function deleteTodoItem(id) {
    return new Promise((resolve, reject) => {
        const newTable = table.filter((e) => {
            return e && e.id != id;
        });
        if (table.length == newTable.length) 
            reject({code: "ITEM NOT FOUND"});
        else {
            table = newTable;
            resolve(table);
        }
    })
}
exports.deleteTodoItem = deleteTodoItem;