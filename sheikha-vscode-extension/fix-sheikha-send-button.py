from pathlib import Path

p = Path("src/chat/sheikhaChatProvider.js")
s = p.read_text()

icon = """<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>"""

s = s.replace(
    '<button id="sendBtn" type="button">إرسال</button>',
    f'<button id="sendBtn" class="send-btn" type="button" title="إرسال">{icon}</button>'
)

s = s.replace(
    "button,select{margin-top:8px;padding:8px;border-radius:8px;border:0}\nbutton{background:#10b981;color:#001b12;font-weight:700}\nselect{background:#21262d;color:#fff}",
    """button,select{margin-top:8px;padding:8px;border-radius:8px;border:0}
select{background:#21262d;color:#fff}
.send-btn{
 width:42px;height:42px;border:none;border-radius:12px;cursor:pointer;
 display:flex;align-items:center;justify-content:center;
 background:#16a34a;color:white;transition:.2s;
}
.send-btn:hover{transform:translateY(-1px);background:#15803d}
.send-btn:disabled{opacity:.6;cursor:not-allowed}
.send-btn svg{width:18px;height:18px}"""
)

s = s.replace(
    "sendBtn.textContent = 'جاري الإرسال...';",
    "sendBtn.innerHTML = '...';"
)

s = s.replace(
    "sendBtn.textContent = 'إرسال';",
    f"sendBtn.innerHTML = `{icon}`;"
)

p.write_text(s)
print("✅ Sheikha send icon fixed")
