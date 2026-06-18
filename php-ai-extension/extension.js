const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('phpAiChatSidebar', {
            resolveWebviewView(webviewView) {
                webviewView.webview.options = { enableScripts: true };

                webviewView.webview.html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                padding: 10px;
                                color: var(--vscode-foreground);
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            }
                            h3 { margin-bottom: 10px; color: #4af; }
                            #chat-box {
                                height: 300px;
                                overflow-y: auto;
                                background: #111;
                                border: 1px solid #333;
                                padding: 8px;
                                border-radius: 4px;
                                margin-bottom: 10px;
                                font-size: 12px;
                                line-height: 1.4;
                            }
                            #input-container {
                                display: flex;
                                gap: 5px;
                                margin-top: 10px;
                            }
                            #user-input {
                                flex: 1;
                                padding: 6px;
                                background: #333;
                                color: #fff;
                                border: 1px solid #555;
                                border-radius: 3px;
                                font-size: 12px;
                            }
                            #user-input:focus {
                                outline: none;
                                border-color: #4af;
                                background: #3a3a3a;
                            }
                            #send-btn {
                                padding: 6px 12px;
                                background: var(--vscode-button-background);
                                color: var(--vscode-button-foreground);
                                border: none;
                                border-radius: 3px;
                                cursor: pointer;
                                font-size: 12px;
                                font-weight: 500;
                                transition: background 0.2s;
                            }
                            #send-btn:hover {
                                background: var(--vscode-button-hoverBackground);
                            }
                            .msg { margin-bottom: 8px; padding: 6px; border-radius: 3px; }
                            .user-msg { background: #1a3a3a; color: #4af; }
                            .ai-msg { background: #2a2a2a; color: #81c784; }
                            .error-msg { background: #3a1a1a; color: #ff6b6b; }
                            pre {
                                background: #222;
                                padding: 6px;
                                border-radius: 3px;
                                overflow-x: auto;
                                font-size: 11px;
                                margin: 6px 0;
                                color: #b0e0e6;
                            }
                            .loading { color: #ffa500; font-style: italic; }
                        </style>
                    </head>
                    <body>
                        <h3>🚀 Hyper AI PHP Core</h3>
                        <div id="chat-box">
                            <div class="msg ai-msg">اهلاً بك في نظام الذكاء الاصطناعي المتقدم لـ PHP 🤖</div>
                        </div>
                        <div id="input-container">
                            <input id="user-input" type="text" placeholder="اسأل الذكاء الاصطناعي..." />
                            <button id="send-btn">إرسال</button>
                        </div>
                        <script>
                            const vscode = acquireVsCodeApi();
                            const chatBox = document.getElementById('chat-box');
                            const userInput = document.getElementById('user-input');
                            const sendBtn = document.getElementById('send-btn');

                            sendBtn.addEventListener('click', sendMessage);
                            userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

                            async function sendMessage() {
                                const text = userInput.value.trim();
                                if (!text) return;

                                const userMsg = document.createElement('div');
                                userMsg.className = 'msg user-msg';
                                userMsg.textContent = '👤 أنت: ' + text;
                                chatBox.appendChild(userMsg);
                                userInput.value = '';
                                chatBox.scrollTop = chatBox.scrollHeight;

                                const loadingMsg = document.createElement('div');
                                loadingMsg.className = 'msg loading';
                                loadingMsg.textContent = '⏳ جاري المعالجة...';
                                chatBox.appendChild(loadingMsg);

                                try {
                                    const res = await fetch('http://localhost:8000/v1/chat', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-AI-Engine-Key': 'sk_live_php_hyper_engine_secret_key_2026_prod'
                                        },
                                        body: JSON.stringify({ question: text })
                                    });

                                    chatBox.removeChild(loadingMsg);

                                    if (!res.ok) {
                                        const errorMsg = document.createElement('div');
                                        errorMsg.className = 'msg error-msg';
                                        errorMsg.textContent = '❌ خطأ: ' + res.status;
                                        chatBox.appendChild(errorMsg);
                                    } else {
                                        const result = await res.json();
                                        const aiMsg = document.createElement('div');
                                        aiMsg.className = 'msg ai-msg';
                                        aiMsg.innerHTML = '<b>🤖 AI:</b> ' + result.answer + '<pre>' + result.raw_code + '</pre>';
                                        chatBox.appendChild(aiMsg);
                                    }
                                } catch (error) {
                                    chatBox.removeChild(loadingMsg);
                                    const errorMsg = document.createElement('div');
                                    errorMsg.className = 'msg error-msg';
                                    errorMsg.innerHTML = '❌ خطأ في الاتصال:<br><pre>' + error.message + '</pre>';
                                    chatBox.appendChild(errorMsg);
                                }

                                chatBox.scrollTop = chatBox.scrollHeight;
                            }
                        </script>
                    </body>
                    </html>`;

                webviewView.webview.onDidReceiveMessage(async (data) => {
                    if (data.command === 'ask_ai') {
                        try {
                            const res = await fetch('http://localhost:8000/v1/chat', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-AI-Engine-Key': 'sk_live_php_hyper_engine_secret_key_2026_prod'
                                },
                                body: JSON.stringify({ question: data.text })
                            });
                            const result = await res.json();
                            webviewView.webview.postMessage({
                                command: 'ai_response',
                                text: result.answer,
                                raw_code: result.raw_code
                            });
                        } catch (error) {
                            webviewView.webview.postMessage({
                                command: 'ai_response',
                                text: 'خطأ في الاتصال بالسيرفر السحابي.',
                                raw_code: error.message
                            });
                        }
                    }
                });
            }
        })
    );
}

function deactivate() {}

module.exports = { activate, deactivate };
