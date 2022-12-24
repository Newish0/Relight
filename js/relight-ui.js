
// Trying to be like React...
class RelightUI {

    constructor(root, theme, langList, defaultLang, langSelCallback, lineWrapping, lineWrapCallback, formatCodeCallback) {
        this.root = root;
        this.theme = theme;
        this.elements = []

        const langSel = this.createLangSel(langList, defaultLang, langSelCallback);
        const lineWrap = this.createLineWrap(lineWrapping, lineWrapCallback);
        const autoFormatBtn = this.createFormatCodeBtn(formatCodeCallback);

        this.elements.push(this.createToolbar(langSel, lineWrap, autoFormatBtn));

    }

    render() {
        for (const eln of this.elements)
            eln.remove();

        this.root.append(...this.elements)
    }

    createFormatCodeBtn(formatCodeCallback) {
        const btn = document.createElement("button");
        btn.textContent = "Format Code";
        btn.addEventListener("click", formatCodeCallback);
        btn.className = "Relight-UI Format-Code";
        return btn;
    }

    createLineWrap(lineWrapping, lineWrapCallback) {
        const lineWrapContainer = document.createElement("span");
        const lineWarpCheck = document.createElement("input");
        const lineWarpLabel = document.createElement("label");

        lineWarpCheck.type = "checkbox";
        lineWarpCheck.id = "Relight-UI-Line-Wrap-Check";
        lineWarpCheck.checked = lineWrapping;
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