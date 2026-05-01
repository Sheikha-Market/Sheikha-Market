/**
 * sheikha-meta-injector.js
 * حقن وسوم Meta ديناميكياً من تكوين API — أفضل من Meta ومتكاملة معها
 * يُستدعى في الصفحات التي تحتاج وسوماً ديناميكية
 */
(function () {
    'use strict';
    const BASE = 'https://sheikha.top';
    const path = window.location.pathname.replace(/^\//, '') || 'index';
    const pageKey = path === '' ? 'index' : path.replace('.html', '');

    function setMeta(name, content, isProperty) {
        const attr = isProperty ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function setLink(rel, href) {
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }

    fetch('/api/meta/config')
        .then(r => r.json())
        .then(res => {
            if (!res.success || !res.data) return;
            const { defaults, pages } = res.data;
            const page = pages[pageKey] || pages['index'];
            if (!page) return;

            if (page.title) document.title = page.title;
            if (page.description) setMeta('description', page.description);
            if (page.keywords) setMeta('keywords', page.keywords);
            if (page.robots) setMeta('robots', page.robots);
            if (defaults?.author) setMeta('author', defaults.author);
            if (defaults?.copyright) setMeta('copyright', defaults.copyright);
            if (defaults?.themeColor) setMeta('theme-color', defaults.themeColor);
            if (page.path) setLink('canonical', BASE + (page.path === '/' ? '/' : page.path));

            if (page.ogImage && defaults?.siteName) {
                setMeta('og:type', 'website', true);
                setMeta('og:title', page.title || document.title, true);
                setMeta('og:description', page.description || '', true);
                setMeta('og:url', BASE + (page.path === '/' ? '/' : page.path), true);
                setMeta('og:site_name', defaults.siteName, true);
                setMeta('og:locale', defaults.locale || 'ar_SA', true);
                setMeta('og:image', BASE + page.ogImage, true);
                setMeta('og:image:width', '1200', true);
                setMeta('og:image:height', '630', true);
                setMeta('og:image:alt', page.title || 'شيخة', true);
            }
            if (page.ogImage && defaults?.twitterSite) {
                setMeta('twitter:card', 'summary_large_image');
                setMeta('twitter:site', defaults.twitterSite);
                setMeta('twitter:title', page.title || document.title);
                setMeta('twitter:description', page.description || '');
                setMeta('twitter:image', BASE + page.ogImage);
            }
        })
        .catch(() => {});
})();
