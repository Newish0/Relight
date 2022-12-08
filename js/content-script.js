

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
    const response = await chrome.runtime.sendMessage({ action: "loadCodeMirror" }); // return promise

    if(response === 0)
        return response;

    // Wait until CodeMirror object is defined
    while (typeof CodeMirror === 'undefined') { 
        await sleep(1)
    }

    return response
}

const launchCodeMirror = async () => {
    console.debug("[Relight]", "started CM");
}

const getCodeMirrorMode = async (fileExtension) => {

    // Request to add CodeMirror meta.js
    const response = await chrome.runtime.sendMessage({ action: "loadMeta" });

    if(response === 0) 
       return null;
    
    // Wait until CodeMirror findModeByExtension is defined
    while (typeof CodeMirror.findModeByExtension === 'undefined') { 
        await sleep(1)
    }

    return CodeMirror.findModeByExtension(fileExtension);
}



const main = () => {
    console.debug("[Relight]", "at start of main");

    if (!pageIsPlainText()) {
        console.debug("[Relight]", "exit: not a plain page");
        return;
    }

    const cmReady =  reqLoadCodeMirror();

    const fileExt = fileExtFromPath(document.location.pathname);

    if (!fileExt) {
        const text = document.body.firstChild.textContent;
        if (testForJSON(text)) fileExt = "json";
        else if (testForXML(text)) fileExt = "xml";
        else fileExt = "txt"; // .txt: default file extension for unknown type
    }

    console.debug("[Relight]", "determined file type as", fileExt);
    

    cmReady.then((res) => {
        if(!res) {
            console.error("[Relight]", "exit: failed to init code mirror");
            return;
        } 

        getCodeMirrorMode(fileExt).then(mode => {
            if(mode) launchCodeMirror();
            else console.error("[Relight]", "exit: file type not supported");
        });
    });
} // main




main();