const CODEMIRROR_ROOT = "lib/codemirror-5.65.3/";

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
    CODEMIRROR_ROOT + "addon/indent-guide/indent-guide.css"
]

const CODEMIRROR_ESSENTIAL_JS = [
    CODEMIRROR_ROOT + "lib/codemirror.js",
    CODEMIRROR_ROOT + "mode/meta.js",
    CODEMIRROR_ROOT + "addon/mode/simple.js",
    CODEMIRROR_ROOT + "addon/display/autorefresh.js",
    CODEMIRROR_ROOT + "addon/edit/matchbrackets.js",
    CODEMIRROR_ROOT + "addon/hint/show-hint.js",
    CODEMIRROR_ROOT + "addon/indent-guide/indent-guide.js"
]



const handleExecute = (files, sender, sendResponse) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: sender.tab.id },
            files: files,
        });
    sendResponse({ code: 1 })
}


const handleStyle = (files, sender, sendResponse) => {

    chrome.scripting.insertCSS(
        {
            target: { tabId: sender.tab.id },
            files: files,
        });

    sendResponse({ code: 1 })
}


const loadCodeMirror = (sender, sendResponse) => {
    console.debug("[Relight] Load Code Mirror essential JS from", CODEMIRROR_ESSENTIAL_JS);
    console.debug("[Relight] Load Code Mirror essential CSS from", CODEMIRROR_ESSENTIAL_CSS);

    handleStyle(CODEMIRROR_ESSENTIAL_CSS, sender, sendResponse);
    handleExecute(CODEMIRROR_ESSENTIAL_JS, sender, sendResponse);
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

            default:
                sendResponse({ code: 0 })

        }

    }
);