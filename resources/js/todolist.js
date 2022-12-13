const endPoints = {
    getTodoItems : {
        string : "/api/items",
        method : "GET"
    },
    addTodoItem : {
        string : "/api/items/add",
        method : "POST"
    }
}

let items = [];
let newItems = [];
let changedItemIds = [];

// create DOM element of a todo item
function newTodoItem(item) {
    let todoitem = document.createElement("div");
    todoitem.classList.add("todoitem");

    // check box
    {
        let checkcontainer = document.createElement("label");
        checkcontainer.classList.add("checkcontainer");
        let checkinput = document.createElement("input");
        checkinput.type = "checkbox";
        if (item.done) checkinput.checked = item.done;
        let replacecheck = document.createElement("span");
        replacecheck.classList.add("todocheck");
        checkcontainer.appendChild(checkinput);
        checkcontainer.appendChild(replacecheck);
        todoitem.appendChild(checkcontainer);
    }

    // text
    {
        let textcontainer = document.createElement("div");
        textcontainer.classList.add("textcontainer");
        let textinput = document.createElement("input");
        textinput.classList.add("todotext");
        textinput.type = "text";
        if (item.text) textinput.value = item.text;
        textcontainer.appendChild(textinput);
        todoitem.appendChild(textcontainer);
    }

    // date
    {
        let datecontainer = document.createElement("div");
        datecontainer.classList.add("datecontainer");
        let dateinput = document.createElement("input");
        dateinput.classList.add("tododate");
        dateinput.type = "date";
        if (item.remindDate) {
            // add .overdue if overdue
            let date = new Date(item.remindDate);
            console.log(date);
            if (date.getTime() < Date.now()) {
                dateinput.classList.add("overdue");
            }
            // add .done if done
            if (item.done) dateinput.classList.add("done");
            // change the string into one that html would accept
            dateinput.value = item.remindDate.substring(0, 10);
        }
        datecontainer.appendChild(dateinput);
        todoitem.appendChild(datecontainer);
    }

    // add item id to the id attribute
    if (item.id) {
        todoitem.id = item.id;
    }

    return todoitem;
}

// create the fields for a new todo item
function createEmptyTodoItem() {
    let todolist = document.getElementById("todolist");
    const itemcount = todolist.children.length-1;
    let newItem = newTodoItem({id:-1});  // -1 for new item
    regItemListener(newItem);
    todolist.insertBefore(newItem, todolist.children[itemcount]);
}

// add the changed input's item it to the list of changed ids
function addChangedInput(event) {
    console.log("Input changed: ");
    console.log(event.currentTarget);
    const item = event.currentTarget;
    if (item.id == -1)
        newItems.push(item.id);
    else
        changedItemIds.push(item.id);
}

// register a listener to a todo item
function regItemListener(item) {
    item.addEventListener("change", addChangedInput);
}

async function addItems() {
    if (newItemIds.length == 0) return;
    for (newItem of newItemIds) {

    }
}

async function onLoad() {
    let plusItem = document.getElementById("addTodoitem");
    // load items
    let ep = endPoints.getTodoItems;
    items = await fetch(ep.string, {method: ep.method})
        .then((res) => res.json());

    let todolist = document.getElementById("todolist");
    
    for (let it of items) {
        it = newTodoItem(it);
        regItemListener(it);
        todolist.insertBefore(it, plusItem);   // always insert before the last element (+ sign)
    }

    // add event listeners
    plusItem.addEventListener("click", createEmptyTodoItem);
}
window.addEventListener("load", onLoad);