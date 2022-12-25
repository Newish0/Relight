const RelightSettings = {
    // Non-CodeMirror settings
    maxAcceptableLineLen: 4096,
    autoFormat: false,
    useIndentedWrappedLine: false,

    /// CodeMirror settings
    theme: "dracula",
    tabSize: 4,
    smartIndent: true,
    lineWrapping: false,
    lineNumbers: true,
    readOnly: true,
    maxHighlightLength: 10000,
    styleActiveLine: true,
    matchBrackets: true,
    indentUnit: 4,
    indentGuide: true,
    hideFirstIndentGuide: true,
    indentWithTabs: false,

    // Additional CodeMirror Settings
    lineSeparator: null,
    // specialChars: {},
    // electricChars: true,
    inputStyle: "textarea",
    spellcheck: false,
    autocorrect: false,
    autocapitalize: false,
    rtlMoveVisually: false,
    wholeLineUpdateBefore: true,
    keyMap: "default",
    extraKeys: {},
    // configureMouse: null,
    gutters: [],
    fixedGutter: true,
    coverGutterNextToScrollbar: false,
    scrollbarStyle: "native",
    firstLineNumber: 1,
    showCursorWhenSelecting: false,
    resetSelectionOnContextMenu: true,
    lineWiseCopyCut: true,
    pasteLinesPerSelection: true,
    selectionsMayTouch: false,
    screenReaderLabel: null,
    disableInput: false,
    dragDrop: true,
    allowDropFileTypes: [],
    cursorBlinkRate: 530,
    cursorScrollMargin: 0,
    cursorHeight: 1,
    singleCursorHeightPerLine: true,
    workTime: 100,
    workDelay: 100,
    flattenSpans: true,
    addModeClass: false,
    pollInterval: 100,
    undoDepth: 200,
    historyEventDelay: 1250,
    viewportMargin: 10,
    moveInputWithCursor: true,
    tabindex: null,
    autofocus: false,
    direction: "ltr",
    // phrases: null,
    // hintOptions: null
}

export default RelightSettings;
