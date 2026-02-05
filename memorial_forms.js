// Соответствие value -> текст для типа молебна
var MOLEBEN_TYPE_LABELS = {
    thanksgiving: 'Благодарственный',
    sick: 'О болящих',
    addicted: 'О зависимых',
    petition: 'Просительный',
    travel: 'О путешествующих',
    prisoners: 'О заключенных',
    beginning: 'На начало дела'
};

// Срок поминовения
var MEMORIAL_PERIOD_LABELS = { sorokoust: 'Сорокоуст', half_year: 'На полгода', year: 'На год' };
var PSALTER_PERIOD_LABELS = { '40_days': '40 дней', half_year: 'На полгода', year: 'На год' };

// Функция для обработки имён из textarea
function processNames(textareaValue) {
    if (!textareaValue || textareaValue.trim() === '') {
        return [];
    }
    var names = textareaValue
        .split(/[,\n]/)
        .map(function(name) { return name.trim(); })
        .filter(function(name) { return name.length > 0; });
    names = names.map(function(name) {
        if (name.length === 0) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    });
    return names;
}

// Функция для отображения имён в декоративном блоке
function displayNames(names, targetElement) {
    if (names.length === 0) {
        targetElement.innerHTML = '<p class="text-muted">Введите имена в поле слева</p>';
        return;
    }
    var html = '';
    names.forEach(function(name, index) {
        html += '<div class="name-item">' +
            '<span class="name-number">' + (index + 1) + '.</span> ' +
            '<span class="name-text">' + name + '</span></div>';
    });
    targetElement.innerHTML = html;
}

// Обновление надписи и цвета типа в декоративном блоке (о здравии / об упокоении)
function updateDecorativeType(elementId, isHealth) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = isHealth ? 'О здравии' : 'Об упокоении';
    el.classList.remove('type-health', 'type-repose');
    el.classList.add(isHealth ? 'type-health' : 'type-repose');
}

// Инициализация формы с обновлением имён в реальном времени
function initializeForm(textareaId, displayElementId, options) {
    options = options || {};
    var textarea = document.getElementById(textareaId);
    var displayElement = document.getElementById(displayElementId);
    if (!textarea || !displayElement) return;

    function refreshNames() {
        var names = processNames(textarea.value);
        displayNames(names, displayElement);
    }

    textarea.addEventListener('input', refreshNames);
    textarea.addEventListener('paste', function() {
        setTimeout(refreshNames, 10);
    });
    refreshNames();

    // Для молебна — обновление типа в декоративном блоке
    if (options.molebenTypeRadios) {
        var typeEl = document.getElementById(options.decorativeTypeId);
        if (typeEl) {
            options.molebenTypeRadios.forEach(function(radio) {
                radio.addEventListener('change', function() {
                    var label = MOLEBEN_TYPE_LABELS[this.value];
                    if (label) typeEl.textContent = label;
                    typeEl.classList.remove('type-health', 'type-repose');
                });
            });
        }
    }

    // Для форм с о здравии/об упокоении
    if (options.healthReposeRadios && options.decorativeTypeId) {
        options.healthReposeRadios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                updateDecorativeType(options.decorativeTypeId, this.value === 'health');
            });
        });
    }
}

// Сброс декоративного блока при закрытии модального окна
function getDefaultDecorativeState(service) {
    if (service === 'moleben') return { text: 'Благодарственный', typeClass: '' };
    return { text: 'О здравии', typeClass: 'type-health' };
}

document.addEventListener('DOMContentLoaded', function() {
    // Молебен
    var molebenRadios = [
        document.querySelector('input[name="moleben_type"][value="thanksgiving"]'),
        document.querySelector('input[name="moleben_type"][value="sick"]'),
        document.querySelector('input[name="moleben_type"][value="addicted"]'),
        document.querySelector('input[name="moleben_type"][value="petition"]'),
        document.querySelector('input[name="moleben_type"][value="travel"]'),
        document.querySelector('input[name="moleben_type"][value="prisoners"]'),
        document.querySelector('input[name="moleben_type"][value="beginning"]')
    ].filter(Boolean);
    initializeForm('molebenNames', 'molebenNamesList', {
        decorativeTypeId: 'molebenDecorativeType',
        molebenTypeRadios: molebenRadios
    });

    // Поминовение
    var memorialTypeRadios = document.querySelectorAll('input[name="memorial_type"]');
    initializeForm('memorialNames', 'memorialNamesList', {
        decorativeTypeId: 'memorialDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(memorialTypeRadios)
    });
    var memorialPeriodEl = document.getElementById('memorialDecorativePeriod');
    if (memorialPeriodEl) {
        document.querySelectorAll('input[name="memorial_period"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                var label = MEMORIAL_PERIOD_LABELS[this.value];
                if (label) memorialPeriodEl.textContent = label;
            });
        });
    }

    // Проскомидия
    var proskomediaTypeRadios = document.querySelectorAll('input[name="proskomedia_type"]');
    initializeForm('proskomediaNames', 'proskomediaNamesList', {
        decorativeTypeId: 'proskomediaDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(proskomediaTypeRadios)
    });

    // Обедня
    var liturgyTypeRadios = document.querySelectorAll('input[name="liturgy_type"]');
    initializeForm('liturgyNames', 'liturgyNamesList', {
        decorativeTypeId: 'liturgyDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(liturgyTypeRadios)
    });

    // Псалтырь
    var psalterTypeRadios = document.querySelectorAll('input[name="psalter_type"]');
    initializeForm('psalterNames', 'psalterNamesList', {
        decorativeTypeId: 'psalterDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(psalterTypeRadios)
    });
    var psalterPeriodEl = document.getElementById('psalterDecorativePeriod');
    if (psalterPeriodEl) {
        document.querySelectorAll('input[name="psalter_period"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                var label = PSALTER_PERIOD_LABELS[this.value];
                if (label) psalterPeriodEl.textContent = label;
            });
        });
    }

    // Отправка форм (демо)
    var forms = document.querySelectorAll('form[id$="Form"]');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var formData = new FormData(this);
            console.log('Данные формы:', Object.fromEntries(formData));
            alert('Форма отправлена! (Это демо-версия)');
        });
    });

    // Очистка при закрытии модального окна
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            var block = this.querySelector('.memorial-decorative-block');
            var service = block && block.getAttribute('data-service');
            var textareas = this.querySelectorAll('textarea[id$="Names"]');
            var nameLists = this.querySelectorAll('div[id$="NamesList"]');
            var typeEls = this.querySelectorAll('.decorative-service-type');

            textareas.forEach(function(ta) { ta.value = ''; });
            nameLists.forEach(function(nl) {
                nl.innerHTML = '<p class="text-muted">Введите имена в поле слева</p>';
            });

            if (service === 'moleben' && typeEls.length) {
                typeEls[0].textContent = 'Благодарственный';
                typeEls[0].className = 'decorative-service-type';
            }
            if (['memorial', 'proskomedia', 'liturgy', 'psalter'].indexOf(service) !== -1 && typeEls.length) {
                typeEls[0].textContent = 'О здравии';
                typeEls[0].className = 'decorative-service-type type-health';
            }
            var periodEl = this.querySelector('.decorative-service-period');
            if (periodEl) {
                if (service === 'memorial') periodEl.textContent = 'Сорокоуст';
                if (service === 'psalter') periodEl.textContent = '40 дней';
            }
        });
    });
});
