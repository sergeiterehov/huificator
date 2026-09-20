const go = document.getElementById('go');
const status = document.getElementById('status');
const statusText = document.getElementById('status-text');

// Версия берётся из манифеста, чтобы не расходилась с ним
document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;

// Случайный подзаголовок при каждом открытии попапа
const TAGLINES = [
    'Поднимает настроение и не только',
    'Вставляем туда, где не хватало',
    'Твой браузер этого ещё не пробовал',
    'На конец! Правильные формулировки',
    'Вставляем буквы не туда',
    'Сайт с глубоким смыслом',
    'Нравится, не нравится - терпи моя красавица',
    'Сделаем замену по-быстрому',
    'Горячий контент бесплатно',
    'Это поэтично',
];

document.getElementById('tagline').textContent =
    TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

const setStatus = (state, text) => {
    status.dataset.state = state;
    statusText.textContent = text;
};

// Главный фрейм: у каждого фрейма своё состояние, показываем состояние вкладки
const MAIN_FRAME = { frameId: 0 };

const RESTRICTED = /^(chrome|edge|about|devtools|view-source|chrome-extension|moz-extension):/i;
const STORE = /^https:\/\/chromewebstore\.google\.com|^https:\/\/chrome\.google\.com\/webstore/i;

const activeTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
};

// Отрисовка состояния content-скрипта
function render(enabled) {
    if (enabled) {
        setStatus('on', 'Включено');
        go.textContent = 'Уже включено';
        go.disabled = true;
    } else {
        setStatus('off', 'Выключено');
        go.textContent = 'Делать хорошо!';
        go.disabled = false;
    }
}

function renderUnavailable(tab) {
    const url = tab?.url ?? '';

    if (url && (RESTRICTED.test(url) || STORE.test(url))) {
        setStatus('unavailable', 'Отказ: системна страница');
    } else {
        // Страница открыта до установки/перезагрузки расширения
        setStatus('unavailable', 'Сперва обнови страницу (F5)');
    }

    go.textContent = 'Делать хорошо!';
    go.disabled = true;
}

// Узнаём состояние при открытии попапа
(async () => {
    const tab = await activeTab();

    if (!tab?.id) {
        setStatus('unavailable', 'Не удалось определить вкладку');
        return;
    }

    try {
        const { enabled } = await chrome.tabs.sendMessage(tab.id, { type: 'huificator:status' }, MAIN_FRAME);
        render(enabled);
    } catch {
        renderUnavailable(tab);
    }
})();

// MV3: chrome.tabs.executeScript is gone.
// The content script is already declared in the manifest, so we just message it.
go.addEventListener('click', async () => {
    const tab = await activeTab();

    if (!tab?.id) return;

    go.disabled = true;
    setStatus('unknown', 'Включаю…');

    try {
        // Без frameId — на все фреймы, чтобы включить и внутри iframe
        await chrome.tabs.sendMessage(tab.id, { type: 'huificator:start' });
        render(true);
        statusText.textContent = 'Улучшение активировано';
    } catch (e) {
        console.warn('Журбанизатор: не удалось запустить', e);
        renderUnavailable(tab);
    }
});