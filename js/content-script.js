

// check if site is plain text
const pageIsPlainText = () => {
    return document.body.firstChild.nodeName === "PRE" && document.body.firstChild.textContent === document.body.textContent;
}


// Extracts file extension from path
const fileExtFromPath = (path) => {
    const re = /^.*\.(.+)$/;

    return path.match(re) ? path.match(re)[1] : null;
}

const testForJSON = (string) => {
    try {
        JSON.parse(string);
    } catch (error) {
        return false;
    }

    return true;
}

const testForXML = (string) => {
    try {
        const parser = new DOMParser();
        const xml = parser.parseFromString(string, "text/xml");
    } catch (error) {
        return false;
    }

    return true;
}


const sleep = ms => new Promise(r => setTimeout(r, ms));


const reqLoadCodeMirror = async () => {
    await chrome.runtime.sendMessage({ action: "loadCodeMirror" }); // return promise

    // Wait until CodeMirror object is defined
    while (typeof CodeMirror === "undefined") {
        await sleep(1)
    }

    return 1
}


const getCodeMirrorMode = async (fileExtension) => {
    if (typeof CodeMirror === "undefined")
        await reqLoadCodeMirror();

    // Wait until CodeMirror findModeByExtension is defined
    while (typeof CodeMirror.findModeByExtension === "undefined") {
        await sleep(1)
    }

    return CodeMirror.findModeByExtension(fileExtension);
}

const reqLoadModeDependency = async (mode) => {
    await chrome.runtime.sendMessage({ action: "loadCodeMirrorMode", mode });

    return mode;
}


const refreshModeTillReady = async (editor, mode) => {
    do {
        editor.setOption("mode", mode.mime);
        await sleep(1);
    } while (editor.getMode().name !== mode.mode);
}

const modeChangeCallback = (evt, editor) => {
    const { value } = evt.target;
    const mode = CodeMirror.findModeByMIME(value);

    reqLoadModeDependency(mode);
    editor.setOption("mode", mode.mime);
    refreshModeTillReady(editor, mode);
}


const lineWrapChangeCallback = (evt, editor) => {
    const { checked } = evt.target;
    editor.setOption("lineWrapping", checked);
}


const formatCodeCallback = async (evt, editor) => {
    let modeName = editor.getMode().name;

    switch (modeName) {
        case "htmlmixed":
        case "html":
        case "xml":
            console.log("TODO format as HTML")
            break;
        case "css":
            console.log("TODO format as CSS")
            break;
        case "javascript":
        default:
            if (typeof js_beautify === "undefined") {
                await chrome.runtime.sendMessage({ action: "loadBeautify", mode: "js" });
            }

            while (typeof js_beautify === "undefined") {
                await sleep(1);
            }

            const options = { indent_size: 2, space_in_empty_paren: true }

            editor.setValue(js_beautify(editor.getValue(), options));
    }
}



const launchCodeMirror = (mode) => {
    console.debug("[Relight]", "started CM");

    let theme = "dracula";
    const contentEln = document.querySelector("pre");
    const textContent = contentEln.textContent;
    const container = RelightUI.createAppContainer();
    const ui = new RelightUI(container,
        theme,
        CodeMirror.modeInfo,
        mode,
        (evt) => { modeChangeCallback(evt, editor) },
        (evt) => { lineWrapChangeCallback(evt, editor) },
        (evt) => { formatCodeCallback(evt, editor) }
    );

    document.body.appendChild(container);
    ui.render();

    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDarkTheme) container.style.backgroundColor = "#000";


    // hide original content
    contentEln.style.display = "none";

    // create instance of CodeMirror editor
    const editor = CodeMirror(container, {
        value: textContent,
        mode: mode.mime,
        tabSize: 4,
        smartIndent: true,
        theme: theme, // TODO: user selectable
        lineWrapping: false,
        lineNumbers: true,
        autoRefresh: true,
        readOnly: true,
        maxHighlightLength: 10000,
        matchBrackets: true,
        indentUnit: 4,
        indentGuide: true,
        hideFirstIndentGuide: true,
        // foldGutter: true,
        // gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        // extraKeys: { "Ctrl-Space": "autocomplete" }
    });

    editor.setSize("100%", "100%");

    // refresh mode dependency finishes loading
    refreshModeTillReady(editor, mode);
}





const main = () => {
    console.debug("[Relight]", "at start of main");

    if (!pageIsPlainText()) {
        console.debug("[Relight]", "exit: not a plain page");
        return;
    }

    const cmReady = reqLoadCodeMirror();

    let fileExt = fileExtFromPath(document.location.pathname);

    if (!fileExt) {
        const text = document.body.firstChild.textContent;
        if (testForJSON(text)) fileExt = "json";
        else if (testForXML(text)) fileExt = "xml";
        else fileExt = "txt"; // .txt: default file extension for unknown type
    }

    console.debug("[Relight]", "determined file type as", fileExt);


    cmReady.then((res) => {
        if (!res) {
            console.error("[Relight]", "exit: failed to init code mirror");
            throw "failed to init code mirror";
        }

        return getCodeMirrorMode(fileExt);
    }).then(mode => {
        if (mode)
            return reqLoadModeDependency(mode);

        console.error("[Relight]", "exit: file type not supported");
        throw "failed to init code mirror";

    }).then(mode => {
        launchCodeMirror(mode);
    });
} // main




main();