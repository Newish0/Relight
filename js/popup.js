

window.onload = () => {
    document.querySelector("#version").textContent = chrome.runtime.getManifest().version;
}