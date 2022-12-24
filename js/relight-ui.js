
// Trying to be like React...
class RelightUI {

    constructor(root, theme, langList, defaultLang, langSelCallback, lineWrapping, lineWrapCallback, formatCodeCallback) {
        this.root = root;
        this.theme = theme;
        this.topElements = [];
        this.bottomElements = [];

        const langSel = this.createLangSel(langList, defaultLang, langSelCallback);
        const lineWrap = this.createLineWrap(lineWrapping, lineWrapCallback);
        const autoFormatBtn = this.createFormatCodeBtn(formatCodeCallback);

        this.topElements.push(this.createToolbar(langSel, lineWrap, autoFormatBtn));


        // Binded elements
        this.infoData = {
            lineCount: 0,
            fileSize: 0,
            selection: "",
            cursor: {
                line: 0,
                ch: 0,
                sticky: "",
                xRel: 0
            }
        }

        this.lineCountEln = this.createInfoEln(this.infoData.lineCount + " Lines");
        this.fileSizeEln = this.createInfoEln(this.infoData.fileSize + " Bytes");
        this.lineEln = this.createInfoEln("Ln " + (this.infoData.cursor.line + 1));
        this.chEln = this.createInfoEln("Col " + (this.infoData.cursor.ch + 1));
        this.selectedEln = this.createInfoEln("");

        // const fileSizeEln = this.createBindInfo();

        this.bottomElements.push(this.createInfoBar(this.lineEln, this.chEln, this.selectedEln, this.lineCountEln, this.fileSizeEln));
    }

    render() {
        for (const eln of this.topElements)
            eln.remove();
        for (const eln of this.bottomElements)
            eln.remove();

        this.root.prepend(...this.topElements);
        this.root.append(...this.bottomElements);
    }

    createInfoEln(content) {
        const infoEln = document.createElement("span");
        infoEln.textContent = content;
        return infoEln;
    }

    infoDataUpdate() {
        this.lineCountEln.textContent = this.infoData.lineCount + " Lines";
        this.fileSizeEln.textContent = this.infoData.fileSize + " Bytes";
        this.lineEln.textContent = "Ln " + (this.infoData.cursor.line + 1);
        this.chEln.textContent = "Col " + (this.infoData.cursor.ch + 1);
        this.selectedEln.textContent = this.infoData.selection.length > 0 ? `(${this.infoData.selection.length} selected)`: "";
    }

    createInfoBar(...elements) {
        const bar = document.createElement("div");
        bar.className = `Relight-UI Bar InfoBar cm-s-${this.theme} CodeMirror`;
        bar.append(...elements);
        return bar;
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
        bar.className = `Relight-UI Bar Toolbar cm-s-${this.theme} CodeMirror`;
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