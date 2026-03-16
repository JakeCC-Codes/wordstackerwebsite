const supabaseInstance = supabase.createClient('https://hdwkextgvjynwcfzyrdl.supabase.co', 'sb_publishable_FhQpe_upTFVHfUcmfDNRhA_jZQI1UO4');
const blockStackLoad = document.getElementById("blockstack");
const blockStackClear = document.getElementById("blockstackclear");
const bstxPrompt = document.getElementById("blockstackinputprompt");
const popupOpen = document.getElementById("popupopen");
const popupClose = document.getElementById("popupclose");
let leaderboardTag = localStorage.getItem("leaderboardTag") ?? "@anonymous";
if (blockStackLoad) {
    blockStackLoad.innerHTML = localStorage.getItem("localBlockStack");
}
if (bstxPrompt) {
    bstxPrompt.textContent = leaderboardTag + " | Type a Word/Phrase"; // TODO: make helper function... eventually...
}
async function _LoadLeaderboard() {
    const leaderboard = document.getElementById("sololeaderboard");
    const userboard = document.getElementById("userboard");
    const { data, error } = await supabaseInstance.from('blockstacks_solo_leaderboard').select().order('blockstackcount', {ascending: false});
    if (error) {
        console.error('Error loading leaderboard:', error);
    } else {
        let rankPos = -1;
        if (leaderboard) {
            const entryCap = 29;
            let entries = [`<col width="20%"/><col width="60%"/><col width="20%"/><tr><th>TAG</th><th>LASTQUOTE</th><th>STACK</th></tr>`];
            for (let i=0; i<data.length; i++) {
                const entry = data[i];
                if (entry.tag == leaderboardTag) { rankPos = i; }
                if (i > entryCap) { if(rankPos != -1) { break; } continue; }
                const rank = i+1;
                let rankTitle = ``;
                switch(rank) { // TODO: This should be a helper function
                    case 1:
                        rankTitle = ` class="firstplace"`;
                        break;
                    case 2:
                        rankTitle = ` class="secondplace"`;
                        break;
                    case 3:
                        rankTitle = ` class="thirdplace"`;
                        break;
                }
                entries.push(`<tr${rankTitle}><td>${entry.tag}</td><td>"${entry.quote}"</td><td>${entry.blockstackcount}</td><td>`);
            }
            leaderboard.innerHTML = entries.join('');
        }
        if (userboard) {
            let userEntry = `<col width="20%"/><col width="60%"/><col width="20%"/><tr><td>${leaderboardTag}</td><td>...</td><td>...</td></tr>`;
            if (rankPos != -1) {
                const userData = data[rankPos];
                let rankText = `${++rankPos}`;
                switch (rankText.at(-1)) { // TODO: Make this a helper function
                    case '1':
                        rankText += `${rankText.at(-2)}${rankText.at(-1)}` == '11' ? 'th' : rankPos === 1 ? 'st &#128081;' : 'st';
                        break;
                    case '2':
                        rankText += `${rankText.at(-2)}${rankText.at(-1)}` == '12' ? 'th' : rankPos === 2 ? 'nd &#129352;' : 'nd';
                        break;
                    case '3':
                        rankText += `${rankText.at(-2)}${rankText.at(-1)}` == '13' ? 'th' : rankPos === 3 ? 'rd &#129353;' : 'rd';
                        break;
                    default:
                        rankText += 'th';
                        break;
                }
                userEntry = `<col width="20%"/><col width="60%"/><col width="20%"/><tr><td colspan="3"><strong>You are placed ${rankText}</strong></td></tr><tr><td>${leaderboardTag}</td><td>"${userData.quote}"</td><td>${userData.blockstackcount}</td></tr>`;
            }
            userboard.innerHTML = userEntry;
        }
    }
}
_LoadLeaderboard();

window.addEventListener('DOMContentLoaded', (ev) => {
    function onBlockStackClear(ev) {
        localStorage.removeItem("localBlockStack");
        localStorage.removeItem("leaderboardTag");
    }

    /**
     * 
     * @param {CustomEvent<{ tag: string; textHTML: string; rawHTMLString: string; dateSent: any; }>} ev 
     */
    async function onBlockCreate(ev) {
        const blockStack = ev.detail.parent;
        localStorage.setItem("localBlockStack", blockStack.innerHTML);
        const messageCount = blockStack.childElementCount;
        const newBlockCount = messageCount + 1;
        if (messageCount > 10500) {
            // Turn on dark mode
            console.log("darkmode!");
        }
        if (messageCount < 1) {
            leaderboardTag = ev.detail.tag;
            localStorage.setItem("leaderboardTag", leaderboardTag);
        }

        const { error } = await supabaseInstance.rpc('upsert_bstx_leaderboard_solo', {bstxtag: leaderboardTag, bstxcount: newBlockCount, bstxquote: ev.detail.textHTML});
        if (error) {
            console.error('Error inserting:', error);
        }
    }

    function onPopupOpen(ev) {
        popupClose.focus();
        popupClose.style.top = '0%';
        popupClose.style.opacity = '0';
        popupClose.animate([
            {opacity: 0},
            {opacity: 0.94}
        ], {
            duration: 200,
            easing: "ease-out",
            fill: 'forwards'
        }).play();
    }
    function onPopupClose(ev) {
        popupClose.style.opacity = '0.94';
        const animation = popupClose.animate([
            {opacity: 0.94},
            {opacity: 0}
        ], {
            duration: 200,
            easing: "ease-out",
            fill: 'forwards'
        });
        animation.play();
        animation.finished.then(() => {
            popupClose.style.top = '100%';
            popupOpen.focus();
            _LoadLeaderboard();
        });
    }
    blockStackClear?.addEventListener('click', onBlockStackClear, {passive: true});
    popupOpen?.addEventListener('click', onPopupOpen, {passive: true});
    popupClose?.addEventListener('click', onPopupClose, {passive: true});
    document.addEventListener('blockcreate', onBlockCreate, {passive: true});
});

//localStorage.removeItem("localMessages");