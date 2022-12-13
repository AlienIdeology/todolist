const endPoints = {
    addTodoItem : {
        string : "/addTodoItem",
        method : "POST"
    }
}

// create DOM element of a todo item
function newTodoItem() {
    let todoitem = document.createElement("div");
    todoitem.classList.add("todoitem");

    // check box
    {
        let checkcontainer = document.createElement("label");
        checkcontainer.classList.add("checkcontainer");
        let checkinput = document.createElement("input");
        checkinput.type = "checkbox";
        checkinput.checked = false;
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
        datecontainer.appendChild(dateinput);
        todoitem.appendChild(datecontainer);
    }

    return todoitem;
}

// create the fields for a new todo item
function createTodoItem() {
    let todolist = document.getElementById("todolist");
    const itemcount = todolist.children.length-1;
    let newItem = newTodoItem();
    regItemListener(newItem);
    todolist.insertBefore(newItem, todolist.children[itemcount]);
}

function checkInputListener() {}

function textInputListener() {}

function dateInputListener() {}

function regItemListener(item) {
    let checkinput = item.getElementsByClassName("checkcontainer")[0]
        .getElementsByTagName("input")[0];
    checkinput.addEventListener("change", checkInputListener);
    let textinput = item.getElementsByClassName("textcontainer")[0]
        .getElementsByTagName("todotext")[0];
    textinput.addEventListener("change", textInputListener);
    let dateinput = item.getElementsByClassName("datecontainer")[0]
        .getElementsByTagName("tododate")[0];
        dateinput.addEventListener("change", dateInputListener);
}

function onLoad() {
    document.getElementById("addTodoitem").addEventListener("click", createTodoItem);
    let todolist = document.getElementById("todolist").getElementsByClassName("todoitem");
    for (let item of todolist) {
        regItemListener(item);
    }
}
window.addEventListener("load", onLoad);