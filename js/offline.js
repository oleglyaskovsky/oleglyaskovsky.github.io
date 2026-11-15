/* ============================================================
   offline.js - кнопка «Завантажити офлайн-версію» на робочих сторінках.
   Збирає ОДИН .html файл: бере поточний код сторінки і вбудовує в нього
   актуальні style/main.css та js/theme.js. Файл працює без інтернету.
   Усе, що позначено атрибутом data-online-only (посилання назад,
   сама кнопка, цей скрипт), в офлайн-копію не потрапляє.

   Працює лише коли сторінка відкрита через http(s): з GitHub Pages
   або з локального сервера. Якщо відкрити її подвійним кліком як файл
   (file://), браузер забороняє читати сусідні файли.
   ============================================================ */
(function () {
    var btn = document.getElementById('offlineBtn');
    if (!btn) return;

    var label = btn.textContent;

    function say(text, ms) {
        var t = document.getElementById('toast');
        if (!t) { alert(text); return; }
        t.textContent = text;
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, ms || 2200);
    }

    function abs(url) { return new URL(url, location.href).href; }

    function getText(url) {
        return fetch(url, { cache: 'no-store' }).then(function (r) {
            if (!r.ok) throw new Error(url + ' (' + r.status + ')');
            return r.text();
        });
    }

    function getDataUrl(url) {
        return fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
            return new Promise(function (resolve) {
                var fr = new FileReader();
                fr.onload = function () { resolve(fr.result); };
                fr.readAsDataURL(b);
            });
        });
    }

    async function build() {
        // Беремо вихідний код сторінки (а не DOM у браузері), щоб у файл
        // не потрапив стан, який скрипти вже намалювали
        var html = await getText(location.href.split('#')[0]);
        var doc = new DOMParser().parseFromString(html, 'text/html');

        doc.querySelectorAll('[data-online-only]').forEach(function (el) { el.remove(); });

        var links = Array.prototype.slice.call(doc.querySelectorAll('link[rel~="stylesheet"]'));
        for (var i = 0; i < links.length; i++) {
            var css = await getText(abs(links[i].getAttribute('href')));
            var style = doc.createElement('style');
            style.textContent = css;
            links[i].replaceWith(style);
        }

        var scripts = Array.prototype.slice.call(doc.querySelectorAll('script[src]'));
        for (var j = 0; j < scripts.length; j++) {
            var js = await getText(abs(scripts[j].getAttribute('src')));
            var inline = doc.createElement('script');
            inline.textContent = js.replace(/<\/script/gi, '<\\/script');
            scripts[j].replaceWith(inline);
        }

        var icons = Array.prototype.slice.call(doc.querySelectorAll('link[rel~="icon"]'));
        for (var k = 0; k < icons.length; k++) {
            icons[k].setAttribute('href', await getDataUrl(abs(icons[k].getAttribute('href'))));
        }

        var stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        doc.documentElement.insertBefore(
            doc.createComment(' Офлайн-копія сторінки, зібрана ' + stamp + ' '), doc.head);

        return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    }

    btn.addEventListener('click', async function () {
        if (location.protocol === 'file:') {
            say('Відкрийте сторінку через сайт або локальний сервер: як файл з диска вона не може зібрати копію', 5000);
            return;
        }
        btn.disabled = true;
        btn.textContent = '…';
        try {
            var out = await build();
            var name = (location.pathname.split('/').pop() || 'page').replace(/\.html$/i, '') || 'page';
            var blob = new Blob([out], { type: 'text/html;charset=utf-8' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name + '-offline.html';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
            say('Файл збережено: ' + name + '-offline.html');
        } catch (e) {
            say('Не вдалося зібрати файл. Подробиці в консолі браузера', 4000);
            if (window.console) console.error(e);
        } finally {
            btn.disabled = false;
            btn.textContent = label;
        }
    });
})();
