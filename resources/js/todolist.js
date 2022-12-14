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

let itemsAdded = 0;

// checks if a date (string) denotes some day in the past
function isOverdue(dateStr) {
    if (!dateStr || dateStr.length == 0) return false;
    return new Date(dateStr).getTime() < Date.now();
}

// Based on the properties/values of its inputs, update .todoitem's
// classes like .done and .overdue and id
function setDOMProperties(domItem, id) {
    const inputs = domItem.getElementsByTagName("input");
    const checkinput = inputs[0];
    const dateinput = inputs[2];

    // add/remove .done
    if (checkinput.checked) {
        domItem.classList.add("done");
    } else {
        domItem.classList.remove("done");
    }

    // add/remove .overdue
    if (dateinput.value && isOverdue(dateinput.value)) {
        domItem.classList.add("overdue");
    } else {
        domItem.classList.remove("overdue");
    }

    // if id is provided, update id
    if (id) domItem.id = id;
    return domItem;
}

// create DOM element of a todo item based on a json item
function newDOMItem(jsonItem) {
    let todoitem = document.createElement("div");
    todoitem.classList.add("todoitem");

    // check box
    {
        let checkcontainer = document.createElement("label");
        checkcontainer.classList.add("checkcontainer");
        let checkinput = document.createElement("input");
        checkinput.type = "checkbox";
        checkinput.checked = jsonItem.done;
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
        textinput.value = jsonItem.text || "";
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
        if (jsonItem.remindDate) {
            // change the string into one that html would accept
            dateinput.value = jsonItem.remindDate.substring(0, 10);
        } else {
            dateinput.value = null;
        }
        datecontainer.appendChild(dateinput);
        todoitem.appendChild(datecontainer);
    }
    return setDOMProperties(todoitem, jsonItem.id);
}

// create the fields for a new todo item
function createEmptyItem() {
    // update the items list
    itemsAdded++;
    let emptyJsItem = {
        done: false,
        text: "",
        remindDate: null,
        id: -1 * itemsAdded  // newly created items have a negative Ids to avoid conflict with created items
    };

    let domItem = newDOMItem(emptyJsItem);
    regItemListener(domItem);

    console.log("Item created: ");
    console.log(emptyJsItem);

    // add empty item to dom
    let todolist = document.getElementById("todolist");
    let itemcount = todolist.children.length-1;
    todolist.insertBefore(domItem, todolist.children[itemcount]);
}

// parse a DOM item to json
function parseDOMItem(domItem) {
    let item = {};
    item.id = domItem.id;
    let checkinput = domItem.getElementsByClassName("checkcontainer")[0].getElementsByTagName("input")[0];
    item.done = checkinput.checked;
    let textinput = domItem.getElementsByClassName("todotext")[0];
    item.text = textinput.value || "";
    let dateinput = domItem.getElementsByClassName("tododate")[0];
    item.remindDate = dateinput.value || null;
    return item;
}

// listen for changes to the dom item
async function onItemChanged(domItem) {
    let item = parseDOMItem(domItem);
    // add new item
    if (item.id < 0) {
        // ignore new items with no titles
        if (item.text.length == 0) return;
        const ep = endPoints.addItem;
        let res = await fetch(ep.string, {
            method: ep.method,
            body: JSON.stringify(item),
            headers : {'Content-Type': 'application/json'}
        });
        if (res.ok) {
            // update the id of the dom element so it's no longer negative
            let json = await res.json();
            domItem.id = json.insertId;
        } else {
            let error = await res.json();
            displayErrorMessage(`Unable to add the item \"${item.text}\" (Reason: ${error.code})`);
        }
    } else {
        // update or remove item
        // TODO: removed items
        const ep = endPoints.updateItem;
        let res = await fetch(ep.string+item.id, {
            method: ep.method,
            body: JSON.stringify(item),
            headers : {'Content-Type': 'application/json'}
        })
        if (!res.ok) {
            let error = await res.json();
            displayErrorMessage(`Unable to update the item \"${item.text}\" (Reason: ${error.code})`);
        } else {
            // update classes of .todoitem
            setDOMProperties(domItem, null);
        }
    }
    console.log("items changed");
    console.log(item);
}

// register a listener to a todo item
function regItemListener(domItem) {
    domItem.addEventListener("change", () => {onItemChanged(domItem)});
}

async function onLoad() {
    // for each item, set .todoitem properties and add listeners
    let items = document.getElementById("todolist").getElementsByClassName("todoitem");
    Array.from(items).forEach(domItem => {
        setDOMProperties(domItem, null);
        regItemListener(domItem);
    });

    // plus button listeners
    document.getElementById("addTodoitem").addEventListener("click", createEmptyItem);

    // filter listener
    // add filter checkbox listeners
    let filters = document.getElementById("todofilter").getElementsByClassName("filter");
    filters = Array.from(filters);  // change filters (array-like object) to array
    filters.forEach(e => {
        e.addEventListener("change", (event) => {
            const button = event.currentTarget;
            const fclass = button.value;    // value of checkbox is the class name to be added/removed to todolist
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
}

// display an error message on screen
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

window.addEventListener("load", onLoad);