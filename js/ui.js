
// Trying to be like React...
class UI {

    constructor(root, langList, defaultLang, langSelCallback) {
        this.root = root;

        const langSel = this.createLangSel(langList, defaultLang, langSelCallback);

        this.toolbar = this.createToolbar(langSel);
    }

    render() {
        this.root.appendChild(this.toolbar)
    }

    createLangSel(langList, defaultLang, langSelCallback) {
        const langSel = document.createElement("select");

        for (const lang of langList) {
            const option = document.createElement("option")
            option.value = lang.mime;
            option.textContent = lang.name;

            if (lang.mime === defaultLang.mime) option.setAttribute("selected", true);

            langSel.appendChild(option);
        }

        langSel.className = "Relight-UI LangSel";
        langSel.addEventListener("change", langSelCallback);

        return langSel;
    }

    createToolbar(...elements) {
        const bar = document.createElement("div");
        bar.className = "Relight-UI Toolbar";
        bar.append(...elements);
        return bar;
    }

    static createAppContainer() {
        const container = document.createElement("div");
        container.classList.add("Relight-App-Container");
        return container;
    }
}