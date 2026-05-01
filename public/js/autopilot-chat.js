(function(){
    const log = document.getElementById('chat-log');
    const input = document.getElementById('chat-input');
    const btn  = document.getElementById('chat-send');
    const wsUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/ws/autopilot';
    let ws;
    function init() {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => appendMessage('system','متصل بالشات');
        ws.onmessage = (evt) => {
            try { const msg = JSON.parse(evt.data); appendMessage(msg.from||'ai', msg.text); } catch(e) { appendMessage('ai',evt.data); }
        };
        ws.onclose = () => appendMessage('system','تم قطع الاتصال');
    }
    function appendMessage(sender,text){
        const p = document.createElement('p');
        p.innerHTML = `<strong>${sender}:</strong> ${text}`;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
    btn.onclick = () => {
        const text = input.value.trim();
        if(!text||!ws||ws.readyState!==1) return;
        ws.send(JSON.stringify({from:'user',text}));
        appendMessage('user',text);
        input.value='';
    };
    window.addEventListener('load',init);
})();