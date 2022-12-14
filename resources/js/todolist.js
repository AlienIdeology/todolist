const endPoints = {
    getItems : {
        string : "/api/items",
        method : "GET"
    },
    addItem : {
        string : "/api/items",
        method : "POST"
    },
    updateItem : {
        string : "/api/items/", // + :id routing parameter
        method: "PUT"
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
        if (item.done) {
            checkinput.checked = item.done;
            todoitem.classList.add("done");  // add .done if done
        }
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
                todoitem.classList.add("overdue");
            }
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
    let count = 0;
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
            count++;
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
            count++;
        } else if (item.status == itemStatus.removed) {
        }
    }
    console.log(`Updating ${count} items`);
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
        displayErrorMessage(`Unable to retrieve todo items (Reason: ${error.code}). Please reload`);
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

    // theme selector
    document.getElementById("themeSelector").addEventListener("click", () => {
        // html/root element
        let theme = document.documentElement.getAttribute("theme");
        document.documentElement.setAttribute("theme", theme == "dark" ? "light" : "dark");
    });

    // filter listener
    // add filter checkbox listeners
    let filters = document.getElementById("todofilter").getElementsByClassName("filter");
    filters = Array.from(filters);  // change filters (array-like object) to array
    filters.forEach(e => {
        e.addEventListener("change", (event) => {
            const button = event.currentTarget;
            const fclass = button.value;    // value of checkbox is the right class name
            const todolist = document.getElementById("todolist");

            // if classList contains value
            if (button.checked) {
                todolist.classList.add(fclass);
                todolist.classList.remove("not"+fclass);

            } else {  // "not" prefix classes
                todolist.classList.add("not"+fclass);
                todolist.classList.remove(fclass);
            }
        })
    })

    document.getElementById("removefilter").addEventListener("click", () => {
        const todolist = document.getElementById("todolist");
        // has filters
        if (todolist.classList.length != 0) {
            todolist.className = "";
            // uncheck all filter buttons
            filters.forEach(button => {
                button.checked = false;
            })
        }
    })
    
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

// Problem: this is unreliable, updateItems might not finish executing before the program terminates
// So not all items will be updated
// Possible solution: Update each item individually as they gets changed
window.addEventListener('beforeunload', () => {
    console.log("unloading");
    updateItems();
    return "saving";
});