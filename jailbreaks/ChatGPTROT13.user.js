// ==UserScript==
// @name         ChatGPT ROT13 Button & Decoder
// @namespace    https://renegadeinc.net
// @version      1.1
// @description  Adds a ROT13 encode button to the composer bar and decodes your own ROT13’d messages inline.
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @downloadURL  https://raw.githubusercontent.com/DevNullInc/LLM-Training/refs/heads/main/jailbreaks/ChatGPTROT13.js
// @updateURL    https://raw.githubusercontent.com/DevNullInc/LLM-Training/refs/heads/main/jailbreaks/ChatGPTROT13.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- ROT13 helper ---
    function rot13(str) {
        return str.replace(/[A-Za-z]/g, c =>
                           String.fromCharCode(
            (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        )
                          );
    }

    // --- Insert the "13" button if it's not already there ---
    function addRot13Button() {
        const footer = document.querySelector('[data-testid="composer-footer-actions"]');
        if (!footer || footer.querySelector('#rot13-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'rot13-btn';
        btn.type = 'button';
        btn.innerText = '13';
        btn.title = 'ROT13 Encode';
        Object.assign(btn.style, {
            marginLeft: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fff',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            zIndex: '1000'
        });

        btn.addEventListener('click', () => {
            const editor = document.querySelector('.ProseMirror');
            if (!editor) return;
            editor.focus();

            // Select-all & insert the ROT13’d text
            document.execCommand('selectAll', false, null);
            const raw = editor.innerText.trim();
            const encoded = 'ROT13:' + rot13(raw);
            document.execCommand('insertText', false, encoded);
        });

        footer.appendChild(btn);
    }

    // --- Decode any bubbles that start with "ROT13:" ---
    function decodeBubbles() {
        document.querySelectorAll('div.whitespace-pre-wrap').forEach(el => {
            const txt = el.innerText;
            if (txt.startsWith('ROT13:')) {
                el.innerText = rot13(txt.replace(/^ROT13:/, ''));
            }
        });
    }

    // --- Keep watching for changes to re‑add button & decode new messages ---
    const observer = new MutationObserver(() => {
        addRot13Button();
        decodeBubbles();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial pass
    addRot13Button();
    decodeBubbles();
})();
