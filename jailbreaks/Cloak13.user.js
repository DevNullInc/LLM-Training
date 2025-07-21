// ==UserScript==
// @name         ChatGPT Cloak13 Button (Hairspace Stealth Injector)
// @namespace    https://renegadeinc.net
// @version      2.2
// @description  Replaces ROT13 with hairspace (U+200A) cloaking to bypass moderation filters while keeping text human-readable.
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @downloadURL  https://raw.githubusercontent.com/DevNullInc/LLM-Training/refs/heads/main/jailbreaks/Cloak13.user.js
// @updateURL    https://raw.githubusercontent.com/DevNullInc/LLM-Training/refs/heads/main/jailbreaks/Cloak13.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const hairspace = ' ';

    const triggerWords = [
        'fuck', 'fucking', 'cock', 'dick', 'pussy', 'tits', 'cum', 'clit', 'cunt', 'rape',
        'ass', 'throat', 'penetrate', 'suck', 'blowjob', 'orgasm', 'anal',
        'sexual', 'sex', 'nude', 'nudity', 'moan', 'masturbate', 'jerk', 'horny',
        'breed', 'choke', 'gape', 'ruin', 'slut', 'hole', 'drip'
    ];

    function cloakText(text) {
        const re = new RegExp(triggerWords.join('|'), 'gi');
        return text.replace(re, match => match.split('').join(hairspace));
    }

    function addCloak13Button() {
        const footer = document.querySelector('[data-testid="composer-footer-actions"]');
        if (!footer || footer.querySelector('#cloak13-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'cloak13-btn';
        btn.type = 'button';
        btn.innerText = '13';
        btn.title = 'Cloak13 Encode';
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
            document.execCommand('selectAll', false, null);
            const raw = editor.innerText.trim();
            const encoded = cloakText(raw);
            document.execCommand('insertText', false, encoded);
        });

        footer.appendChild(btn);
    }

    function decloakBubbles() {
        document.querySelectorAll('div.whitespace-pre-wrap').forEach(el => {
            if (el.dataset.cloak13Decoded) return;
            el.innerText = el.innerText.replace(/\u200A/g, '');
            el.dataset.cloak13Decoded = true;
        });
    }

    function waitForFooterAndInject(retries = 30) {
        const footer = document.querySelector('[data-testid="composer-footer-actions"]');
        if (footer) {
            addCloak13Button();
        } else if (retries > 0) {
            console.log('Cloak13: Waiting for footer...');
            setTimeout(() => waitForFooterAndInject(retries - 1), 500);
        } else {
            console.warn('Cloak13: Footer not found after retries.');
        }
    }

    const domObserver = new MutationObserver(() => {
        waitForFooterAndInject();
        decloakBubbles();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    addCloak13Button();
    decloakBubbles();
})();
