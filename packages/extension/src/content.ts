import { applyHuificator } from "huificator";
import type { HuificatorMessage, HuificatorResponse } from "./messages";

const PREFIX = "ху";
const INTERVAL_MS = 1000;

let enabled = false;

const start = (): void => {
    if (enabled) return;

    enabled = true;

    setInterval(() => applyHuificator(PREFIX), INTERVAL_MS);

    console.log("Хуификатор активирован!");
};

chrome.runtime.onMessage.addListener((message: HuificatorMessage, _sender, sendResponse) => {
    // Запрос состояния от попапа
    if (message?.type === "huificator:status") {
        sendResponse({ enabled } satisfies HuificatorResponse);

        return false;
    }

    if (message?.type !== "huificator:start") return false;

    const already = enabled;

    if (!already) start();

    sendResponse({ enabled, already } satisfies HuificatorResponse);

    return false;
});
