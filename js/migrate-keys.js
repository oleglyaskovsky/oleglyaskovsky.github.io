/* ============================================================
   migrate-keys.js - ОДНОРАЗОВЕ перенесення збережених даних
   робочих сторінок зі старих ключів localStorage у нові.
   Нічого не видаляє: старі дані лишаються, нові лише створюються.

   Як користуватися: відкрийте кожну робочу сторінку один раз на
   кожному пристрої (телефон, ПК), де є збережені дані. Після цього
   файл можна просто видалити: сторінки працюватимуть і без нього.
   ============================================================ */
(function () {
    var map = {
        'kasa-v1': 'cash_v1',
        'insigniaStock_v2': 'items_v2',
        'stockData_v2': 'sizes_v2',
        'stockData_v2_name': 'sizes_v2_name'
    };
    try {
        for (var oldKey in map) {
            var value = localStorage.getItem(oldKey);
            if (value !== null && localStorage.getItem(map[oldKey]) === null) {
                localStorage.setItem(map[oldKey], value);
            }
        }
    } catch (e) {}
})();
