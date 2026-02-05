// Функция для изменения цвета креста в зависимости от выбора типа поминовения
function changeCrossColor() {
    // Находим все радио-кнопки "Об упокоении" в модальных окнах
    const reposeRadios = document.querySelectorAll('input[name="memorial_type"][value="repose"], \
                                                      input[name="proskomedia_type"][value="repose"], \
                                                      input[name="liturgy_type"][value="repose"], \
                                                      input[name="psalter_type"][value="repose"]');

    // Для каждого радио-кнопки "Об упокоении" добавляем обработчик события
    reposeRadios.forEach(radio => {
        // Находим соответствующий крест
        const crossImg = radio.closest('.modal').querySelector('.decorative-cross');
        const initialSrc = crossImg.getAttribute('data-initial-src');
        const reposeSrc = crossImg.getAttribute('data-repose-src');

        // Обработчик события при изменении выбора
        radio.addEventListener('change', function() {
            if (this.checked) {
                // Если выбрано "Об упокоении", меняем изображение креста на красный
                crossImg.src = reposeSrc;
            } else {
                // Если выбрано "О здравии", возвращаем изначальное изображение креста
                crossImg.src = initialSrc;
            }
        });
    });
}

// Вызываем функцию после полной загрузки DOM
document.addEventListener('DOMContentLoaded', changeCrossColor);