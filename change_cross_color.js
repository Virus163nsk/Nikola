document.addEventListener('DOMContentLoaded', function () {
    // Находим все радиокнопки для «Об упокоении» и «О здравии»
    const reposeRadios = document.querySelectorAll('input[name="memorial_type"][value="repose"]');
    const healthRadios = document.querySelectorAll('input[name="memorial_type"][value="health"]');
    // Находим все изображения креста с атрибутами data-initial-src и data-repose-src
    const crosses = document.querySelectorAll('.decorative-cross[data-initial-src][data-repose-src]');

    // Функция для обновления всех крестов в зависимости от выбранного типа поминовения
    function updateCrosses() {
        // Проверяем, выбран ли хотя бы один «Об упокоении»
        const isReposeSelected = Array.from(reposeRadios).some(radio => radio.checked);

        crosses.forEach(img => {
            img.src = isReposeSelected ? img.dataset.reposeSrc : img.dataset.initialSrc;
        });
    }

    // Навешиваем обработчики на радиокнопки
    reposeRadios.forEach(radio => {
        radio.addEventListener('change', updateCrosses);
    });

    healthRadios.forEach(radio => {
        radio.addEventListener('change', updateCrosses);
    });

    // Инициализация состояния при загрузке страницы
    updateCrosses();
});