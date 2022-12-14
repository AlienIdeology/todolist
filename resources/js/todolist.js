const endPoints = {
    getItems : {
        string : "/api/items",
        method : "GET"
    },
    addItem : {
        string : "/api/items/add",
        method : "POST"
    },
    updateItem : {
        string : "/api/items/update/",
        method: "POST"
    }
}

const itemStatus = {
    removed: -1,
    unupdated: 0,
    updated: 1,
    created: 2
};

const items = []; // array of item wrappers {item: item, status: ...}
let itemsAdded = 0;
const POLL_FREQ = 60000; // 1 min in ms

// create DOM element of a todo item based on a json item
function newDOMItem(item) {
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
        if (item.text) textinput.value = item.text || "";
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

    let domItem = newDOMItem(emptyJsItem);  // -1 for new item?
    regItemListener(domItem);

    // update the items list
    itemsAdded++;
    // newly created items have a negative Ids to avoid conflict with created items
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
        // TODO: add removed item
        // only set status to "changed" if the item has existed (is not new)
        if (it.item.id == item.id) {
            if (it.status == itemStatus.unupdated) {
                it.status = itemStatus.updated;
            }
            const id = it.item.id;  // temporarily store it
            it.item = parseDOMItem(item);  // replace the old item with the new one
            it.item.id = id;
            console.log("Input changed:");
            console.log(it);
        } 
    });
}

function parseDOMItem(domItem) {
    let item = {};
    let checkinput = domItem.getElementsByClassName("checkcontainer")[0].getElementsByTagName("input")[0];
    item.done = checkinput.checked;
    let textinput = domItem.getElementsByClassName("todotext")[0];
    item.text = textinput.value || "";
    let dateinput = domItem.getElementsByClassName("tododate")[0];
    item.remindDate = dateinput.value || null;
    return item;
}

// register a listener to a todo item
function regItemListener(item) {
    item.addEventListener("change", addChangedItem);
}

// add, update, or remove items. call this periodically
async function updateItems() {
    console.log("Updating items");
    for (let item of items) {
        if (item.status == itemStatus.created) {
            // ignore new items with no titles
            if (item.item.text.length == 0) continue;
            const ep = endPoints.addItem;
            let res = await fetch(ep.string, {
                method: ep.method,
                body: JSON.stringify(item),
                headers : {'Content-Type': 'application/json'}
            });
            if (res.ok) {
                item.status = itemStatus.unupdated;
                // update the id of the created todo item so it's no longer negative
                // also update the id of the dom element
                let domItem = document.getElementById(item.item.id);
                let json = await res.json();
                domItem.id = json.insertId;
                item.item.id = json.insertId;
            } else {
                let error = await res.json();
                displayErrorMessage(`Unable to add the item \"${item.item.text}\" (Reason: ${error.code})`);
            }
        } else if (item.status == itemStatus.updated) {
            const ep = endPoints.updateItem;
            const id = item.item.id;
            let res = await fetch(ep.string+id, {
                method: ep.method,
                body: JSON.stringify(item),
                headers : {'Content-Type': 'application/json'}
            })
            if (res.ok) {
                item.status = itemStatus.unupdated;
            } else {
                let error = await res.json();
                displayErrorMessage(`Unable to update the item \"${item.item.text}\" (Reason: ${error.code})`);
            }
        } else if (item.status == itemStatus.removed) {
        }
    }
}

function displayErrorMessage(errorMsg) {
    let err = document.createElement("div");
    err.classList.add("errorMsg");
    err.textContent = errorMsg;
    let errContainer = document.getElementById("errorMsgContainer");
    errContainer.appendChild(err);
    // delete error message after 5 seconds
    setTimeout(() => {
        errContainer.removeChild(err);
    }, 5000);
}

async function onLoad() {
    let plusItem = document.getElementById("addTodoitem");
    // load items
    let ep = endPoints.getItems;
    let res = await fetch(ep.string, {method: ep.method});
    if (!res.ok) {
        let error = await res.json();
        displayErrorMessage(`Unable to load items (Reason: ${error.code}). Please reload`);
    }
    else {
        let jsonitems = await res.json();

        let todolist = document.getElementById("todolist");
        
        for (let it of jsonitems) {
            console.log("item:");
            console.log(it);
            items.push({
                item: it,
                status: itemStatus.unupdated
            });
            let domIt = newDOMItem(it);
            regItemListener(domIt);
            todolist.insertBefore(domIt, plusItem);   // always insert before the last element (+ sign)
        }
    }

    // add event listeners
    plusItem.addEventListener("click", createEmptyItem);
    
    // poll changes to the page, then updates the db
    // setInterval(() => {
    //     console.log("polling...");
    //     updateItems();
    //     periodicUpdate();
    // }, POLL_FREQ);
}

window.addEventListener("load", onLoad);

function updateBeforePageChange() {
    if (document.visibilityState == "hidden")
        updateItems();
}

window.addEventListener('visibilitychange', updateBeforePageChange);