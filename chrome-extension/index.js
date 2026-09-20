/*
Авторы:
    - Терехов Сергей (isergeiterehov@gmail.com)
*/

const G = ["а", "у", "о", "ы", "и", "э", "я", "ю", "ё", "е"];
const S = ["б", "в", "г", "д", "ж", "з", "й", "к", "л", "м", "н", "п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ"];

const Y = {
    "а": "я",
    "у": "ю",
    "о": "е",
    "ы": "и",
    "и": "и",
    "э": "е",
    "я": "я",
    "ю": "ю",
    "ё": "е",
    "е": "е",
};

/**
 * @returns {string}
 * @param {string} src
 */
function huefy(src, prefix) {
    if (src.length < 3) return src;

    let ending = src.toLowerCase();

    // Пропускаем начальные согласные (для коротких слов)
    ending = ending.substr(Math.min(...G.map((s) => ending.indexOf(s)).filter((i) => i >= 0)));

    // Берем окончание
    ending = ending.substr(ending.length < 5 ? -3 : -5)

    // Сокращаем окончание до первой согласной
    ending = ending.substr(Math.min(...S.map((s) => ending.indexOf(s)).filter((i) => i >= 0)));

    const base = src.substr(0, src.length - ending.length);
    const gIndex = Math.max(...G.map((g) => base.lastIndexOf(g)));

    ending = src.substr(gIndex + 1);

    const x = base[gIndex];
    const y = Y[x];

    if (!y) return src;

    return `${src}-${prefix}${y}${ending}`;
}

function applyHuificator(prefix) {
    [...document.querySelectorAll("div, span, text, tspan, button, pre, p, a")]
        .reduce((list, el) => [...list, ...el.childNodes], [])
        .filter((el) => (el instanceof Text) && el.__huified !== el.textContent)
        .forEach((el) => {
            el.textContent = String(el.textContent).replaceAll(/[а-яА-ЯёЁ]+/g, (s) => `${huefy(s, prefix)}`);
            el.__huified = el.textContent;
        });
}

let huificatorEnabled = false;

window.__huificator = (prefix = "ху") => {
    if (huificatorEnabled) return;

    huificatorEnabled = true;

    setInterval(() => applyHuificator(prefix), 1000);

    console.log("Хуификатор активирован!");
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // Запрос состояния от попапа
    if (message?.type === "huificator:status") {
        sendResponse({ enabled: huificatorEnabled });
        return false;
    }

    if (message?.type !== "huificator:start") return false;

    const already = huificatorEnabled;

    if (!already) window.__huificator();

    sendResponse({ enabled: huificatorEnabled, already });

    return false;
});
