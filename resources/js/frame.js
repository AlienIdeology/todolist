async function onLoad() {
    const themes = await fetch("/api/themes", {method: "GET"})
                .then((res) => res.json());

    // theme selector
    document.getElementById("themeSelector")
        .getElementsByTagName("input")[0]
        .addEventListener("click", async function() {
        // html/root element
        const theme = document.documentElement.getAttribute("theme");
        let index = themes.indexOf(theme, 0);  // if not found, -1
        index = (index+1)%themes.length;  // update index to the next

        document.documentElement.setAttribute("theme", themes[index]);
        await fetch(`/api/themes/${themes[index]}`, {method: "PUT"});
    });
}

window.addEventListener("load", onLoad);