window.addEventListener('DOMContentLoaded', (ev) => {
    const TEXTBOXPROMPT = document.getElementById("messagesenderprompt");
    var messageSent = false;
    var shiftHeld = false;

    function onModeChange(ev) {
        if (this.value != 0) {
            this.form.submit();
        }
    }
    function onTextBoxKeyDown(ev) {
        switch(ev.key) {
            case "Enter":
                messageSent = !shiftHeld;
                break;
            case "Shift":
                shiftHeld = true;
                break;
        }
    }
    function onTextBoxKeyUp(ev) {
        switch(ev.key) {
            case "Shift":
                shiftHeld = false;
                break;
        }
    }
    function onTextBoxInput(ev) {
        if (messageSent) {
            messageSent = false;
            if (this.textContent != "") {
                this.textContent = "";
            }
        }
    }
    function onTextBoxFocusIn(ev) {
        if (TEXTBOXPROMPT) {
            TEXTBOXPROMPT.style.visibility = "hidden";
        }
    }
    function onTextBoxFocusOut(ev) {
        if (TEXTBOXPROMPT && this.textContent == "") {
            TEXTBOXPROMPT.style.visibility = "visible";
        }
    }


    document.getElementById("modeswitcher")?.addEventListener('change', onModeChange);
    document.getElementById("messagesender")?.addEventListener('focusin', onTextBoxFocusIn);
    document.getElementById("messagesender")?.addEventListener('focusout', onTextBoxFocusOut);
    document.getElementById("messagesender")?.addEventListener('keydown', onTextBoxKeyDown);
    document.getElementById("messagesender")?.addEventListener('keyup', onTextBoxKeyUp);
    document.getElementById("messagesender")?.addEventListener('input', onTextBoxInput);
});