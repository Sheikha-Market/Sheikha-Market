'use strict';

const vscode = require('vscode');
const { askSheikha } = require('../sheikhaApiClient');

class SheikhaChatProvider {
  constructor(context) {
    this.context = context;
  }

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.command !== 'ask') return;

      const editor = vscode.window.activeTextEditor;
      const selectedText = editor ? editor.document.getText(editor.selection) : '';

      webviewView.webview.postMessage({
        command: 'thinking',
        text: 'شيخة تعمل الآن...'
      });

      const result = await askSheikha(msg.text, {
        mode: msg.mode || 'agentic',
        fileName: editor?.document?.fileName || null,
        selectedText,
        workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || []
      });

      webviewView.webview.postMessage({
        command: 'answer',
        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      });
    });
  }

  getHtml() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<style>
body{font-family:system-ui;margin:0;background:#0d1117;color:#e6edf3}
.header{padding:12px;background:#064e3b;color:#fff;font-weight:700}
.chat{height:calc(100vh - 170px);overflow:auto;padding:12px}
.msg{padding:10px;margin:8px 0;border-radius:10px;white-space:pre-wrap}
.user{background:#1f2937}
.ai{background:#052e2b;border:1px solid #10b981}
.controls{padding:10px;border-top:1px solid #30363d}
textarea{width:100%;height:70px;background:#161b22;color:#fff;border:1px solid #30363d;border-radius:8px;padding:8px}
button,select{margin-top:8px;padding:8px;border-radius:8px;border:0}
button{background:#10b981;color:#001b12;font-weight:700}
select{background:#21262d;color:#fff}
</style>
</head>
<body>
<div class="header">Sheikha Advanced Chat — ولا حول ولا قوة إلا بالله</div>
<div class="chat" id="chat"></div>
<div class="controls">
<select id="mode">
<option value="agentic">Agentic Full</option>
<option value="rag">RAG Workspace</option>
<option value="mcp">MCP Tools</option>
<option value="sdk">SDK Builder</option>
<option value="cli">CLI Commands</option>
<option value="graphics">Graphics / UI Plan</option>
<option value="video">Video / Media Plan</option>
</select>
<textarea id="input" placeholder="اكتب طلبك لشيخة..."></textarea>
<button onclick="send()">إرسال إلى شيخة</button>
</div>
<script>
const vscode = acquireVsCodeApi();
const chat = document.getElementById('chat');
function add(cls,text){const d=document.createElement('div');d.className='msg '+cls;d.textContent=text;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
function send(){
 const text=document.getElementById('input').value.trim();
 const mode=document.getElementById('mode').value;
 if(!text)return;
 add('user',text);
 document.getElementById('input').value='';
 vscode.postMessage({command:'ask',text,mode});
}
window.addEventListener('message',e=>{
 const m=e.data;
 if(m.command==='thinking') add('ai',m.text);
 if(m.command==='answer') add('ai',m.text);
});
</script>
</body>
</html>`;
  }
}

module.exports = { SheikhaChatProvider };
