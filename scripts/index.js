const SUPABASE_URL = 'https://hdwkextgvjynwcfzyrdl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FhQpe_upTFVHfUcmfDNRhA_jZQI1UO4';
const supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const blockStack = document.getElementById("blockstack");
const WOBBLELIMIT = 500;
const WOBBLESPEED = 0.75;
const WOBBLETHRESHOLD = 400;

async function loadBlockStack() {
    let blockChunk = {data: [], error: ''};
    let jRange = [0, 999];
    let blocks = [];
    let prevTag = '';
    do {
        blockChunk = await supabaseInstance.from('blockstacks').select().order('created_at', {ascending: true}).range(jRange[0], jRange[1]);

        if (blockChunk.error) {
            console.error(blockChunk.error);
            break;
        } else if (blockStack) {
            let blockstackLength = blockChunk.data.length;
            for (let i=0; i<blockstackLength; i++) {
                const x = blockChunk.data[i];
                const showTag = x.tag !== prevTag ? `<small><em class="tag-style">${x.tag}</em></small>` : '';
                const timeYDate = new Date(x.created_at).toLocaleString();

                blocks.push(`
                    <div id="block-${i+jRange[0]}" class="flex-width">
                        <a href="#block-${i+jRange[0]}" title="${timeYDate}">
                            <div class="block-item wobble-item" tag="${x.tag}" text="${x.text}" time="${timeYDate}">
                                ${x.text}${showTag}
                            </div>
                        </a>
                    </div>`
                );
                prevTag = x.tag;
            }
        }
        jRange[0] += 1000;
        jRange[1] += 1000;
    } while (blockChunk.data.length === 1000)
    if (!blockChunk.error) {
        blockStack.innerHTML = blocks.reverse().join('');

        const hiddenItems = document.getElementsByClassName("render-hidden");
        for (let i=0; i<hiddenItems.length; i++) {
            hiddenItems.item(i).style.visibility = "visible";
        }
        const wobbleItems = document.getElementsByClassName("wobble-item");
        const ws = WOBBLESPEED * 1000;
        for (let i=0; i<WOBBLELIMIT; i++) {
            const wThresh = (wobbleItems.length-i)/WOBBLETHRESHOLD;
            // Wobble Animation
            wobbleItems.item(i)?.animate([ // Clamp this value lol
                { marginLeft: wThresh + 'px'},
                { marginLeft: -wThresh + 'px'}
            ], {
                duration: ws,
                direction: "alternate",
                iterations: "Infinity",
                easing: "ease-in-out",
                iterationStart: Math.random()
            }).play();
        }
        document.dispatchEvent(new CustomEvent('towerload', { detail:{loader:blockStack, tower:blockStack.innerHTML} }));
    }

    supabaseInstance.channel('public:blockstacks').on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'blockstacks' 
    }, (payload) => {
        document.dispatchEvent(new CustomEvent('sudoblockcreate', {detail: {tag: payload.new.tag, text: payload.new.text, requestDate: payload.new.created_at}}))
    }).subscribe();
}
loadBlockStack();

window.addEventListener('DOMContentLoaded', (ev) => {

    async function onBlockCreate(ev) {
        ev.preventDefault();
        const { data, error } = await supabaseInstance.from('blockstacks').insert([{ tag: ev.detail.tag, text: ev.detail.textHTML, rawHTMLString: ev.detail.rawHTMLString }]); // Make sure the column name matches!

        if (error) {
            console.error('Error inserting:', error);
        }
    }

    document.addEventListener('blockcreate', onBlockCreate);
});