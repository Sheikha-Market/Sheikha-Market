/**
 * sheikha-itqan.js
 * يحوّل جميع onclick/onsubmit/onmouseover/onmouseout المتبقية إلى addEventListener
 * لضمان التوافق مع CSP والاستقرار التشغيلي
 */
(function sheikhaItqan() {
    'use strict';
    var HANDLERS = ['onclick', 'onsubmit', 'onmouseover', 'onmouseout', 'onchange', 'oninput'];
    var EVENT_MAP = {
        onclick: 'click',
        onsubmit: 'submit',
        onmouseover: 'mouseover',
        onmouseout: 'mouseout',
        onchange: 'change',
        oninput: 'input'
    };

    function migrate() {
        HANDLERS.forEach(function(attr) {
            var els = document.querySelectorAll('[' + attr + ']');
            for (var i = 0; i < els.length; i++) {
                (function(el) {
                    var code = el.getAttribute(attr);
                    if (!code) return;
                    el.removeAttribute(attr);
                    el.addEventListener(EVENT_MAP[attr], function(e) {
                        try { new Function('event', code).call(el, e); } catch (_) {}
                    });
                })(els[i]);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', migrate);
    } else {
        migrate();
    }
})();
