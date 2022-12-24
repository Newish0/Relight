import RelightSettings from "./settings.config.js"

const resetEntry = (key, inputEln) => {
    const defaultVal = RelightSettings[key];

    if (typeof (defaultVal) === "boolean") {
        inputEln.checked = defaultVal;
    } else {
        inputEln.value = defaultVal;
    }
}

const updateSettings = (key, newVal) => {

    chrome.storage.sync.get(["settings"]).then((result) => {
        const { settings } = result;
        settings[key] = newVal;
        chrome.storage.sync.set({ settings });
    });
}

const createEntry = (key, value, callback) => {
    const entry = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const reset = document.createElement("button");

    entry.className = "Relight-UI entry";
    label.className = "Relight-UI label";
    input.className = "Relight-UI input";
    reset.className = "Relight-UI reset input";

    input.addEventListener("change", () => { callback(key, typeof (value) === "boolean" ? input.checked : input.value) });
    input.addEventListener("keyup", () => { callback(key, typeof (value) === "boolean" ? input.checked : input.value) });

    reset.addEventListener("click", () => {
        resetEntry(key, input);
        callback(key, typeof (value) === "boolean" ? input.checked : input.value);
    });

    label.textContent = key;
    reset.title = "reset";

    if (typeof (value) === "boolean") {
        input.type = "checkbox";
        input.checked = value;
    } else if (typeof (value) === "number") {
        input.type = "number";
        input.value = value;
    } else {
        input.type = "text";
        input.value = value;
    }

    entry.append(label, input, reset);
    return entry;
}

window.onload = () => {
    const container = document.querySelector("#options");

    chrome.storage.sync.get(["settings"]).then((result) => {
        const { settings } = result;


        for (const [key, value] of Object.entries(settings)) {
            // console.log(`${key}: ${value}`);
            // console.log(entry)

            const entry = createEntry(key, value, updateSettings);
            container.appendChild(entry);
        }
    });
}