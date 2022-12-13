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

const itemStatus = {
    removed: -1,
    unchanged: 0,
    changed: 1,
    created: 2
};
const items = []; // array of item wrappers {item: item, status: ...}
let itemsAdded = 0;

// create DOM element of a todo item based on a json item
function newItem(item) {
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
function createEmptyItem() {
    let emptyJsItem = {
        done: false,
        text: "",
        remindDate: null
    };

    let domItem = newItem(emptyJsItem);  // -1 for new item?
    regItemListener(domItem);

    // update the items list
    itemsAdded++;
    domItem.id = -1 * itemsAdded;
    emptyJsItem.id = -1 * itemsAdded;
    items.push({
        item: emptyJsItem,
        status: itemStatus.created,
    });
    console.log("Item created: ");
    console.log(items);

    // add empty item to dom
    let todolist = document.getElementById("todolist");
    let itemcount = todolist.children.length-1;
    todolist.insertBefore(domItem, todolist.children[itemcount]);
}

// A changed item is either:
// (1) a new item: parse the html, add to items list
// (2) an old item with values updated: parse the html, modify item in list
function addChangedItem(event) {
    const item = event.currentTarget;

    items.forEach(it => {
        // only set status to "changed" if the item has existed (is not new)
        if (it.item.id == item.id) {
            if (it.status == itemStatus.unchanged) {
                it.status = itemStatus.changed;
            }
            const id = it.item.id;  // temporarily store it
            it.item = parseItem(item);  // replace the old item with the new one
            it.item.id = id;
            console.log("Input changed:");
            console.log(items);
        } 
    });
}

function parseItem(domItem) {
    let item = {};
    let checkinput = domItem.getElementsByClassName("checkcontainer")[0].getElementsByTagName("input")[0];
    if (checkinput.checked)
        item.done = true;
    let textinput = domItem.getElementsByClassName("todotext")[0];
    item.text = textinput ? textinput.value : "";
    let dateinput = domItem.getElementsByClassName("tododate")[0];
    item.date = dateinput ? dateinput.value : null;
    return item;
}

// register a listener to a todo item
function regItemListener(item) {
    item.addEventListener("change", addChangedItem);
    // TODO: add remove item listener (blocks bubbling)
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
    let jsonitems = await fetch(ep.string, {method: ep.method})
        .then((res) => res.json());

    let todolist = document.getElementById("todolist");
    
    for (let it of jsonitems) {
        console.log("item:");
        console.log(it);
        items.push({
            item: it,
            status: itemStatus.unchanged
        });
        let domIt = newItem(it);
        regItemListener(domIt);
        todolist.insertBefore(domIt, plusItem);   // always insert before the last element (+ sign)
    }

    // add event listeners
    plusItem.addEventListener("click", createEmptyItem);
}
window.addEventListener("load", onLoad);