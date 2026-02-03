// Исправленная версия функции processNames с валидацией наличия хотя бы одного имени
function processNames(textareaValue) {
    if (!textareaValue || textareaValue.trim() === '') {
        return [];
    }
    
    // Обработка имён (разделение по запятым или новым строкам, удаление пробелов)
    var names = textareaValue
        .split(/[,\n]/)
        .map(function(name) { return name.trim(); })
        .filter(function(name) { return name.length > 0; });
    
    // Проверка: хотя бы одно имя должно быть введено
    if (names.length === 0) {
        return [];
    }
    
    // Форматирование имён (первая буква заглавная, остальные строчные)
    names = names.map(function(name) {
        if (name.length === 0) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    });
    
    return names;
}