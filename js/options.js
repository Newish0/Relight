import RelightSettings from "./settings.config.js"

const resetEntry = (key, inputEln) => {
    const defaultVal = RelightSettings[key];

    if (typeof (defaultVal) === "boolean") {
        inputEln.checked = defaultVal;
    } else if (typeof (defaultVal) === "object") {
        inputEln.value = JSON.stringify(defaultVal);
    } else {
        inputEln.value = defaultVal;
    }
}

const updateSettings = async (key, type, newVal) => {

    const result = await chrome.storage.sync.get(["settings"]);

    const { settings } = result;
    try {
        switch (type) {
            case "string":
            case "number":
            case "boolean":
                break;
            case "json":
                newVal = JSON.parse(newVal);
            case "object":
        }
    } catch (error) {
        return false;
    }

    settings[key] = newVal;
    chrome.storage.sync.set({ settings });
    return true;
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

    label.textContent = key;
    reset.title = "reset";

    let type = "string";
    if (typeof (value) === "boolean") {
        input.type = "checkbox";
        input.checked = value;
        type = "boolean";
    } else if (typeof (value) === "object") {
        input.type = "text";
        input.spellcheck = false;
        input.value = JSON.stringify(value);
        type = "json";
    } else if (typeof (value) === "number") {
        input.type = "number";
        input.value = value;
        type = "number";
    } else {
        input.type = "text";
        input.spellcheck = false;
        input.value = value;
        type = "string";
    }

    const handleCallbackAndError = () => {
        callback(key, type, typeof (value) === "boolean" ? input.checked : input.value).then(error => {
            if (!error) {
                input.classList.add("error");
            } else {
                input.classList.remove("error");
            }
        });
    }

    input.addEventListener("change", handleCallbackAndError);
    input.addEventListener("keyup", handleCallbackAndError);

    reset.addEventListener("click", () => {
        resetEntry(key, input);
        handleCallbackAndError();
    });

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