function onLoad() {
    // theme selector
    document.getElementById("themeSelector").addEventListener("click", () => {
        // html/root element
        let theme = document.documentElement.getAttribute("theme");
        document.documentElement.setAttribute("theme", theme == "dark" ? "light" : "dark");
    });
}

window.addEventListener("load", onLoad);