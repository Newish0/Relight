
// TODO: rewrite codemirror.js into background 
//       i.e. content-script tab never has to load external file!


const handleExecute = (files, sender, sendResponse) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: sender.tab.id },
            files: files,
        });
    sendResponse({ code: 1 })
}

const loadCodeMirror = (sender, sendResponse) => {
    const codeMirrorJSPath = "./lib/codemirror-5.65.3/lib/codemirror.js";

    console.debug("[Relight] Load codemirror.js from", codeMirrorJSPath);

    handleExecute([codeMirrorJSPath], sender, sendResponse);
}

const loadMeta = (sender, sendResponse) => {
    const metaJSPath = "./lib/codemirror-5.65.3/mode/meta.js";
    
    // load codemirror.js as well if it has not been loaded
    if(typeof CodeMirror === 'undefined') {
        loadCodeMirror(sender, sendResponse);
    }

    console.debug("[Relight] Load meta.js from", metaJSPath);

    handleExecute([metaJSPath], sender, sendResponse);
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

            case "loadMeta":
                loadMeta(sender, sendResponse);
                break;
            
            default:
                sendResponse({ code: 0 })

        }

    }
);