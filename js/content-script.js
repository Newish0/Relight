

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
    chrome.runtime.sendMessage({ action: "loadCodeMirror" }); // return promise

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
    chrome.runtime.sendMessage({ action: "loadCodeMirrorMode", mode });

    return mode;
}


const modeIsReady = async (mode) => {
    let tmpEditor;
    do {
        tmpEditor = CodeMirror(null, {
            mode: mode.mime,
        });
        await sleep(2);
    } while (tmpEditor.getMode().name !== mode.mode);
}


const launchCodeMirror = async (mode) => {
    console.debug("[Relight]", "started CM");

    const contentEln = document.querySelector("PRE");
    const textContent = contentEln.textContent;
    const container = document.body;

    // hide original content
    contentEln.style.display = "none";

    await modeIsReady(mode);

    // create instance of CodeMirror editor
    const editor = CodeMirror(container, {
        value: textContent,
        mode: mode.mime, // language mode input uses MIME
        tabSize: 4,
        smartIndent: true,
        // theme: "",
        lineWrapping: false,
        lineNumbers: true,
        autoRefresh: true,
        // readOnly: false,
        maxHighlightLength: 1000000,
        matchBrackets: true,
        indentUnit: 4,
        indentGuide: true,
        hideFirstIndentGuide: true,
        // foldGutter: true,
        // gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        // extraKeys: { "Ctrl-Space": "autocomplete" }
    });

    editor.setSize("100%", "100%");
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