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

// Функция для расчета итоговой суммы
function calculateAmount(service, names, period = null) {
    const namesCount = processNames(names).length;
    
    // Для обычных служб
    if (service !== 'memorial' && service !== 'psalter') {
        const basePrice = PRICES[service] || 0;
        return basePrice * namesCount;
    }
    
    // Для поминовения и псалтыря
    const serviceConfig = PRICES[service];
    if (!serviceConfig || !serviceConfig.base) return 0;
    
    const basePrice = serviceConfig.base;
    const multipliers = serviceConfig.multipliers || {};
    const periodMultiplier = multipliers[period] || 1;
    
    return Math.round(basePrice * namesCount * periodMultiplier);
}

// Функция для обновления поля суммы
function updateAmount(service, names, amountInput, period = null) {
    if (!amountInput) return;
    const amount = calculateAmount(service, names, period);
    amountInput.value = amount;
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
    
    // Обновление суммы при инициализации, если указано поле суммы
    if (options.amountInput && textarea) {
        var service = textarea.closest('.modal').querySelector('.memorial-decorative-block').getAttribute('data-service');
        var period = null;
        
        // Определяем выбранный срок для поминовения и псалтыря
        if (service === 'memorial') {
            var selectedPeriod = document.querySelector('input[name="memorial_period"]:checked');
            if (selectedPeriod) period = selectedPeriod.value;
        } else if (service === 'psalter') {
            var selectedPeriod = document.querySelector('input[name="psalter_period"]:checked');
            if (selectedPeriod) period = selectedPeriod.value;
        }
        
        updateAmount(service, textarea.value, options.amountInput, period);
    }
}

// Сброс декоративного блока при закрытии модального окна
function getDefaultDecorativeState(service) {
    if (service === 'moleben') return { text: 'Благодарственный', typeClass: '' };
    return { text: 'О здравии', typeClass: 'type-health' };
}

let PRICES = {};

// Загружаем цены из файла
async function loadPrices() {
    try {
        const response = await fetch('pricing.json');
        if (!response.ok) throw new Error('Не удалось загрузить цены');
        PRICES = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки цен:', error);
        // Устанавливаем цены по умолчанию в случае ошибки
        PRICES = {
            moleben: 50,
            memorial: {
                "base": 100,
                "multipliers": {
                    "sorokoust": 1,
                    "half_year": 2.5,
                    "year": 5
                }
            },
            proskomedia: 150,
            liturgy: 200,
            psalter: {
                "base": 250,
                "multipliers": {
                    "40_days": 1,
                    "half_year": 2.5,
                    "year": 5
                }
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadPrices();
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
    var molebenAmountInput = document.getElementById('molebenAmount');
    initializeForm('molebenNames', 'molebenNamesList', {
        decorativeTypeId: 'molebenDecorativeType',
        molebenTypeRadios: molebenRadios,
        amountInput: molebenAmountInput
    });
    // Обновление суммы при изменении имен
    document.getElementById('molebenNames').addEventListener('input', function() {
        updateAmount('moleben', this.value, molebenAmountInput);
    });
    // Инициализация суммы
    updateAmount('moleben', document.getElementById('molebenNames').value, molebenAmountInput);

    // Поминовение
    var memorialTypeRadios = document.querySelectorAll('input[name="memorial_type"]');
    var memorialAmountInput = document.getElementById('memorialAmount');
    initializeForm('memorialNames', 'memorialNamesList', {
        decorativeTypeId: 'memorialDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(memorialTypeRadios),
        amountInput: memorialAmountInput
    });
    var memorialPeriodEl = document.getElementById('memorialDecorativePeriod');
    if (memorialPeriodEl) {
        document.querySelectorAll('input[name="memorial_period"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                var label = MEMORIAL_PERIOD_LABELS[this.value];
                if (label) memorialPeriodEl.textContent = label;
                // Пересчитываем сумму при изменении срока
                updateAmount('memorial', document.getElementById('memorialNames').value, memorialAmountInput);
            });
        });
    }
    // Обновление суммы при изменении имен
    document.getElementById('memorialNames').addEventListener('input', function() {
        updateAmount('memorial', this.value, memorialAmountInput);
    });
    // Инициализация суммы
    updateAmount('memorial', document.getElementById('memorialNames').value, memorialAmountInput);

    // Проскомидия
    var proskomediaTypeRadios = document.querySelectorAll('input[name="proskomedia_type"]');
    var proskomediaAmountInput = document.getElementById('proskomediaAmount');
    initializeForm('proskomediaNames', 'proskomediaNamesList', {
        decorativeTypeId: 'proskomediaDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(proskomediaTypeRadios),
        amountInput: proskomediaAmountInput
    });
    // Обновление суммы при изменении имен
    document.getElementById('proskomediaNames').addEventListener('input', function() {
        updateAmount('proskomedia', this.value, proskomediaAmountInput);
    });
    // Инициализация суммы
    updateAmount('proskomedia', document.getElementById('proskomediaNames').value, proskomediaAmountInput);

    // Обедня
    var liturgyTypeRadios = document.querySelectorAll('input[name="liturgy_type"]');
    var liturgyAmountInput = document.getElementById('liturgyAmount');
    initializeForm('liturgyNames', 'liturgyNamesList', {
        decorativeTypeId: 'liturgyDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(liturgyTypeRadios),
        amountInput: liturgyAmountInput
    });
    // Обновление суммы при изменении имен
    document.getElementById('liturgyNames').addEventListener('input', function() {
        updateAmount('liturgy', this.value, liturgyAmountInput);
    });
    // Инициализация суммы
    updateAmount('liturgy', document.getElementById('liturgyNames').value, liturgyAmountInput);

    // Псалтырь
    var psalterTypeRadios = document.querySelectorAll('input[name="psalter_type"]');
    var psalterAmountInput = document.getElementById('psalterAmount');
    initializeForm('psalterNames', 'psalterNamesList', {
        decorativeTypeId: 'psalterDecorativeType',
        healthReposeRadios: Array.prototype.slice.call(psalterTypeRadios),
        amountInput: psalterAmountInput
    });
    var psalterPeriodEl = document.getElementById('psalterDecorativePeriod');
    if (psalterPeriodEl) {
        document.querySelectorAll('input[name="psalter_period"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                var label = PSALTER_PERIOD_LABELS[this.value];
                if (label) psalterPeriodEl.textContent = label;
                // Пересчитываем сумму при изменении срока
                updateAmount('psalter', document.getElementById('psalterNames').value, psalterAmountInput);
            });
        });
    }
    // Обновление суммы при изменении имен
    document.getElementById('psalterNames').addEventListener('input', function() {
        updateAmount('psalter', this.value, psalterAmountInput);
    });
    // Инициализация суммы
    updateAmount('psalter', document.getElementById('psalterNames').value, psalterAmountInput);

    // Отправка форм (демо)
    var forms = document.querySelectorAll('form[id$="Form"]');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var formData = new FormData(this);
            // Устанавливаем финальную сумму перед отправкой
            var service = this.querySelector('.memorial-decorative-block').getAttribute('data-service');
            var namesInput = this.querySelector('textarea[id$="Names"]');
            var amountInput = this.querySelector('input[id$="Amount"]');
            var period = null;
            
            if (service === 'memorial') {
                var selectedPeriod = this.querySelector('input[name="memorial_period"]:checked');
                if (selectedPeriod) period = selectedPeriod.value;
            } else if (service === 'psalter') {
                var selectedPeriod = this.querySelector('input[name="psalter_period"]:checked');
                if (selectedPeriod) period = selectedPeriod.value;
            }
            
            if (namesInput && amountInput) {
                updateAmount(service, namesInput.value, amountInput, period);
            }
            
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
