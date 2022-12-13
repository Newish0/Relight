
// Trying to be like React...
class RelightUI {

    constructor(root, theme, langList, defaultLang, langSelCallback, lineWrapCallback) {
        this.root = root;
        this.theme = theme;

        const langSel = this.createLangSel(langList, defaultLang, langSelCallback);
        const lineWrap = this.createLineWrap(lineWrapCallback);
        this.toolbar = this.createToolbar(langSel, lineWrap);

    }

    render() {
        for(const eln of this.root.querySelectorAll(".Relight-UI"))
            eln.remove();

        this.root.appendChild(this.toolbar)
    }

    createLineWrap(lineWrapCallback) {
        const lineWrapContainer = document.createElement("span");
        const lineWarpCheck = document.createElement("input");
        const lineWarpLabel = document.createElement("label");

        lineWarpCheck.type = "checkbox";
        lineWarpCheck.id = "Relight-UI-Line-Wrap-Check";
        lineWarpCheck.addEventListener("change", lineWrapCallback);

        lineWarpLabel.textContent = "Line Wrap";
        lineWarpLabel.for = lineWarpCheck.id;

        lineWrapContainer.className = "Relight-UI Line-Wrap";
        lineWrapContainer.append(lineWarpLabel, lineWarpCheck);

        return lineWrapContainer;
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
        bar.className = `Relight-UI Toolbar cm-s-${this.theme} CodeMirror`;
        bar.append(...elements);
        return bar;
    }

    static createAppContainer() {
        const container = document.createElement("div");
        container.classList.add("Relight-App-Container");
        container.classList.add(`cm-s-${this.theme}`);
        container.classList.add(".CodeMirror");
        return container;
    }
}