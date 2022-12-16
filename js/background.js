const LIB_ROOT = "js/lib/";


const BEAUTIFY_ROOT = LIB_ROOT + "js-beautify-1.14.7/";
const BEAUTIFY_FILES = {
    js: BEAUTIFY_ROOT + "beautify.min.js",
    css: BEAUTIFY_ROOT + "beautify-css.min.js",
    html: BEAUTIFY_ROOT + "beautify-html.min.js",
}


const CODEMIRROR_ROOT = LIB_ROOT + "codemirror-5.65.3/";

const CODEMIRROR_ESSENTIAL_CSS = [
    CODEMIRROR_ROOT + "lib/codemirror.css",
    CODEMIRROR_ROOT + "addon/dialog/dialog.css",
    CODEMIRROR_ROOT + "addon/display/fullscreen.css",
    CODEMIRROR_ROOT + "addon/fold/foldgutter.css",
    CODEMIRROR_ROOT + "addon/hint/show-hint.css",
    CODEMIRROR_ROOT + "addon/lint/lint.css",
    CODEMIRROR_ROOT + "addon/merge/merge.css",
    CODEMIRROR_ROOT + "addon/scroll/simplescrollbars.css",
    CODEMIRROR_ROOT + "addon/search/matchesonscrollbar.css",
    CODEMIRROR_ROOT + "addon/tern/tern.css",
    CODEMIRROR_ROOT + "doc/docs.css",
    CODEMIRROR_ROOT + "mode/tiddlywiki/tiddlywiki.css",
    CODEMIRROR_ROOT + "mode/tiki/tiki.css",
    CODEMIRROR_ROOT + "addon/indent-guide/indent-guide.css",
    CODEMIRROR_ROOT + "theme/dracula.css" // TODO: TMP SOLUTION
]

const CODEMIRROR_ESSENTIAL_JS = [
    CODEMIRROR_ROOT + "lib/codemirror.js",
    CODEMIRROR_ROOT + "mode/meta.js",
    CODEMIRROR_ROOT + "addon/mode/simple.js",
    CODEMIRROR_ROOT + "addon/display/autorefresh.js",
    CODEMIRROR_ROOT + "addon/edit/matchbrackets.js",
    CODEMIRROR_ROOT + "addon/hint/show-hint.js",
    CODEMIRROR_ROOT + "addon/indent-guide/indent-guide.js",
    CODEMIRROR_ROOT + "addon/selection/active-line.js"
]



const handleExecute = (files, sender, sendResponse) => {
    let promise = chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: files,
    }); // TODO: Figure out how callback works and get rid of sleep in content-script
    console.debug("[Relight] Load JS file from", files);

    sendResponse(promise)
}


const handleStyle = (files, sender, sendResponse) => {

    chrome.scripting.insertCSS({
        target: { tabId: sender.tab.id },
        files: files,
    });  // TODO: Figure out how callback works to ensure stability

    console.debug("[Relight] Load CSS file from", files);
}


const loadCodeMirror = (sender, sendResponse) => {
    handleStyle(CODEMIRROR_ESSENTIAL_CSS, sender, sendResponse);
    handleExecute(CODEMIRROR_ESSENTIAL_JS, sender, sendResponse);
}


const loadCodeMirrorMode = (modeObj, sender, sendResponse) => {
    const { mode } = modeObj;
    const modePath = `${CODEMIRROR_ROOT}mode/${mode}/${mode}.js`;

    handleExecute([modePath], sender, sendResponse);
}


const loadBeautify = (beautifyMode, sender, sendResponse) => {
    const file = BEAUTIFY_FILES[beautifyMode];
    
    // TODO error handling for invalid beautifyMode

    handleExecute([file], sender, sendResponse);
}


// Message handler
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.debug("[Relight BG]", sender.tab ?
            "message from a content script:" + sender.tab.url :
            "from the extension");

        // Code 0 on fail, Code 1 on successes
        switch (request.action) {
            case "loadCodeMirror":
                loadCodeMirror(sender, sendResponse);
                break;

            case "loadCodeMirrorMode":
                loadCodeMirrorMode(request.mode, sender, sendResponse);
                break;

            case "loadBeautify":
                loadBeautify(request.mode, sender, sendResponse);
                break;

            default:
                sendResponse({ code: 0 })

        }

    }
);