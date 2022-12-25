

const TIMEOUT_LIMIT = 100; // 30 seconds.
// const TIMEOUT_LIMIT = 30000; // 30 seconds.


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
    let timer = 0;
    while (typeof CodeMirror === "undefined") {
        if (timer > TIMEOUT_LIMIT) throw new Error("Request CodeMirror Timeout");
        await sleep(1);
        timer++;
    }

    return 1
}

const reqLoadThemeCSS = async (theme) => {
    await chrome.runtime.sendMessage({ action: "loadThemeCSS", theme });
}


const getCodeMirrorMode = async (fileExtension) => {
    if (typeof CodeMirror === "undefined")
        await reqLoadCodeMirror();

    // Wait until CodeMirror findModeByExtension is defined
    while (typeof CodeMirror.findModeByExtension === "undefined") {
        await sleep(1);
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

const formatCode = (editor) => {
    let modeName = editor.getMode().name;
    switch (modeName) {
        case "htmlmixed":
        case "html":
        case "xml":
            formatCodeAsHTML(editor);
            break;
        case "css":
            formatCodeAsCSS(editor);
            break;
        case "javascript":
        default:
            formatCodeAsJS(editor);
    }
}

const formatCodeAsJS = async (editor) => {
    if (typeof js_beautify === "undefined")
        await chrome.runtime.sendMessage({ action: "loadBeautify", mode: "js" });

    while (typeof js_beautify === "undefined")
        await sleep(1);

    const options = { indent_size: 4, space_in_empty_paren: true }

    editor.setValue(js_beautify(editor.getValue(), options));
}

const formatCodeAsCSS = async (editor) => {
    if (typeof css_beautify === "undefined")
        await chrome.runtime.sendMessage({ action: "loadBeautify", mode: "css" });

    while (typeof css_beautify === "undefined")
        await sleep(1);

    const options = { indent_size: 4, space_in_empty_paren: true }

    editor.setValue(css_beautify(editor.getValue(), options));
}

const formatCodeAsHTML = async (editor) => {
    if (typeof html_beautify === "undefined")
        await chrome.runtime.sendMessage({ action: "loadBeautify", mode: "html" });

    while (typeof html_beautify === "undefined")
        await sleep(1);

    const options = { indent_size: 2, space_in_empty_paren: true }

    editor.setValue(html_beautify(editor.getValue(), options));
}

const shouldFormat = async (stringContent, maxAcceptableLineLen = 4096) => {
    const lines = stringContent.split("\n");

    for (const line of lines) {
        if (line.length > maxAcceptableLineLen) {
            return true;
        }
    }

    return false;
}



const launchCodeMirror = (mode, settings) => {
    console.debug("[Relight]", "started CM");

    const { theme, autoFormat, lineWrapping, useIndentedWrappedLine, maxAcceptableLineLen } = settings;

    const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const contentEln = document.querySelector("pre");
    const textContent = contentEln.textContent;
    const container = RelightUI.createAppContainer();
    const ui = new RelightUI(container,
        theme,
        CodeMirror.modeInfo,
        mode,
        (evt) => { modeChangeCallback(evt, editor) },
        lineWrapping,
        (evt) => { lineWrapChangeCallback(evt, editor) },
        () => { formatCode(editor) }
    );


    if (isDarkTheme) container.style.backgroundColor = "#000";
    document.body.appendChild(container);
    contentEln.style.display = "none"; // hide original content

    const cmParam = {
        ...settings,
        value: textContent,
        mode: mode.mime,
        autoRefresh: true,
    };

    // create instance of CodeMirror editor
    const editor = CodeMirror(container, cmParam);

    if (useIndentedWrappedLine) {
        addIndentedWrappedLine(editor);
    }

    editor.setSize("100%", "100%");

    const updateUIBindInfoData = () => {
        ui.infoData.selection = editor.getSelection();
        ui.infoData.cursor = editor.getCursor();
        ui.infoData.lineCount = editor.lineCount();
        ui.infoData.fileSize = byteLengthOf(editor.getValue());
        ui.infoDataUpdate();
    }

    editor.on("cursorActivity", updateUIBindInfoData);
    editor.on("change", updateUIBindInfoData);
    updateUIBindInfoData();

    ui.render();

    // refresh mode dependency finishes loading
    refreshModeTillReady(editor, mode).then(() => {
        if (autoFormat && shouldFormat(editor.getValue(), maxAcceptableLineLen)) {
            formatCode(editor);
        }
    });
}


// Add in indented wrapped line. Source: https://codemirror.net/demo/indentwrap.html
// NOTE: A hacky implementation of indented wrapped line, so it doesn't always work
const addIndentedWrappedLine = (editor) => {
    let charWidth = editor.defaultCharWidth(), basePadding = 4;
    editor.on("renderLine", function (cm, line, elt) {
        if (editor.getOption("lineWrapping")) {
            let off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
            elt.style.textIndent = "-" + off + "px";
            elt.style.paddingLeft = (basePadding + off) + "px";
        }
    });
    editor.refresh();
}

// count UTF-8 bytes of a string
// source: https://stackoverflow.com/a/34920444
const byteLengthOf = (s) => {
    //assuming the String is UCS-2(aka UTF-16) encoded
    var n = 0;
    for (var i = 0, l = s.length; i < l; i++) {
        var hi = s.charCodeAt(i);
        if (hi < 0x0080) { //[0x0000, 0x007F]
            n += 1;
        } else if (hi < 0x0800) { //[0x0080, 0x07FF]
            n += 2;
        } else if (hi < 0xD800) { //[0x0800, 0xD7FF]
            n += 3;
        } else if (hi < 0xDC00) { //[0xD800, 0xDBFF]
            var lo = s.charCodeAt(++i);
            if (i < l && lo >= 0xDC00 && lo <= 0xDFFF) { //followed by [0xDC00, 0xDFFF]
                n += 4;
            } else {
                throw new Error("UCS-2 String malformed");
            }
        } else if (hi < 0xE000) { //[0xDC00, 0xDFFF]
            throw new Error("UCS-2 String malformed");
        } else { //[0xE000, 0xFFFF]
            n += 3;
        }
    }
    return n;
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

    }).then(async (mode) => {
        const result = await chrome.storage.sync.get(["settings"]);
        const { settings } = result;
        const { theme } = settings;

        await reqLoadThemeCSS(theme);
        launchCodeMirror(mode, settings);
    });
} // main


main();