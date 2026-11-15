/* ============================================================
   theme.js - перемикач світлої/темної теми для всього сайту.
   Підключається в <head> кожної сторінки (до відмальовування),
   щоб сторінка не блимала при завантаженні.
   Вибір зберігається в localStorage; поки вибору немає,
   використовується тема системи.
   Самі кольори лежать у style/main.css.
   ============================================================ */
(function () {
    var KEY = 'site-theme';
    var root = document.documentElement;
    var btn = null;

    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function system() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light' : 'dark';
    }

    function current() {
        var s = stored();
        return (s === 'light' || s === 'dark') ? s : system();
    }

    function syncMeta() {
        // Колір панелі браузера на телефоні береться з поточної теми
        var color = getComputedStyle(root).getPropertyValue('--bg-dark').trim();
        if (!color) return;
        var m = document.querySelector('meta[name="theme-color"]');
        if (!m) {
            m = document.createElement('meta');
            m.name = 'theme-color';
            document.head.appendChild(m);
        }
        m.content = color;
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        if (btn) {
            var toLight = theme === 'dark';
            btn.textContent = toLight ? '\u2600\uFE0E' : '\u263E\uFE0E';
            btn.title = toLight ? 'Увімкнути світлу тему' : 'Увімкнути темну тему';
            btn.setAttribute('aria-label', btn.title);
        }
        syncMeta();
    }

    function toggle() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(KEY, next); } catch (e) {}
        apply(next);
    }

    function addButton() {
        if (document.querySelector('.theme-toggle')) return;
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        btn.addEventListener('click', toggle);
        document.body.appendChild(btn);
        apply(root.getAttribute('data-theme') || current());
    }

    // 1) одразу, до відмальовування
    root.setAttribute('data-theme', current());

    // 2) кнопка, коли з'явиться <body>
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addButton);
    } else {
        addButton();
    }

    // 3) якщо вибору немає, слідуємо за системою
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: light)');
        var onChange = function () { if (!stored()) apply(system()); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }

    // 4) синхронізація між вкладками
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) apply(current());
    });
})();
