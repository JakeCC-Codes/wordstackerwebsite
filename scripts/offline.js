window.addEventListener('DOMContentLoaded', (ev) => {
    const blockStackLoad = document.getElementById("blockstack");
    const blockStackClear = document.getElementById("blockstackclear");
    if (blockStackLoad) {
        blockStackLoad.innerHTML = localStorage.getItem("localBlockStack");
    }
    
    function onBlockStackClear(ev) {
        localStorage.removeItem("localBlockStack");
    }

    /**
     * 
     * @param {CustomEvent<{ tag: string; textHTML: string; rawHTMLString: string; dateSent: any; }>} ev 
     */
    function onBlockCreate(ev) {
        const blockStack = ev.detail.parent;
        localStorage.setItem("localBlockStack", blockStack.innerHTML);
        const messageCount = blockStack.childElementCount;
        if (messageCount > 5000) {
            // Turn on dark mode
            console.log("darkmode!");
        }
    }
    blockStackClear?.addEventListener('click', onBlockStackClear, {passive: true});
    document.addEventListener('blockcreate', onBlockCreate, {passive: true});
});

//localStorage.removeItem("localMessages");