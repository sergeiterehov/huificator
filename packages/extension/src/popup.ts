import type { HuificatorResponse } from "./messages";
import { TAGLINES } from "./taglines";

const go = document.getElementById("go");
const status = document.getElementById("status");
const statusText = document.getElementById("status-text");
const version = document.getElementById("version");
const tagline = document.getElementById("tagline");

if (
    !(go instanceof HTMLButtonElement) ||
    status === null ||
    statusText === null ||
    version === null ||
    tagline === null
) {
    throw new Error("Разметка попапа не совпадает с ожидаемой");
}

/** Состояния индикатора: `data-state` в разметке. */
type ViewState = "on" | "off" | "unknown" | "unavailable";

const FALLBACK_TAGLINE = "Посмотри на мир под другим углом!";

const setStatus = (state: ViewState, text: string): void => {
    status.dataset.state = state;
    statusText.textContent = text;
};

// Версия берётся из манифеста, чтобы не расходилась с ним
version.textContent = `v${chrome.runtime.getManifest().version}`;

// Случайный подзаголовок при каждом открытии попапа
tagline.textContent = TAGLINES[Math.floor(Math.random() * TAGLINES.length)] ?? FALLBACK_TAGLINE;

// Главный фрейм: у каждого фрейма своё состояние, показываем состояние вкладки
const MAIN_FRAME = { frameId: 0 };

const RESTRICTED = /^(chrome|edge|about|devtools|view-source|chrome-extension|moz-extension):/i;
const STORE = /^https:\/\/chromewebstore\.google\.com|^https:\/\/chrome\.google\.com\/webstore/i;

const activeTab = async (): Promise<chrome.tabs.Tab | undefined> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    return tab;
};

// Отрисовка состояния content-скрипта
const render = (enabled: boolean): void => {
    if (enabled) {
        setStatus("on", "Включено");
        go.textContent = "Уже включено";
        go.disabled = true;

        return;
    }

    setStatus("off", "Выключено");
    go.textContent = "Делать хорошо!";
    go.disabled = false;
};

const renderUnavailable = (tab: chrome.tabs.Tab | undefined): void => {
    const url = tab?.url ?? "";

    if (url !== "" && (RESTRICTED.test(url) || STORE.test(url))) {
        setStatus("unavailable", "Отказ: системна страница");
    } else {
        // Страница открыта до установки/перезагрузки расширения
        setStatus("unavailable", "Сперва обнови страницу (F5)");
    }

    go.textContent = "Делать хорошо!";
    go.disabled = true;
};

// Узнаём состояние при открытии попапа
void (async () => {
    const tab = await activeTab();

    if (tab?.id === undefined) {
        setStatus("unavailable", "Не удалось определить вкладку");

        return;
    }

    try {
        const response = (await chrome.tabs.sendMessage(
            tab.id,
            { type: "huificator:status" },
            MAIN_FRAME,
        )) as HuificatorResponse | undefined;

        render(response?.enabled === true);
    } catch {
        renderUnavailable(tab);
    }
})();

go.addEventListener("click", async () => {
    const tab = await activeTab();

    if (tab?.id === undefined) return;

    go.disabled = true;
    setStatus("unknown", "Включаю…");

    try {
        // Без frameId — на все фреймы, чтобы включить и внутри iframe
        await chrome.tabs.sendMessage(tab.id, { type: "huificator:start" });

        render(true);
        statusText.textContent = "Улучшение активировано";
    } catch (error) {
        console.warn("Журбанизатор: не удалось запустить", error);
        renderUnavailable(tab);
    }
});
