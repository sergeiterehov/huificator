// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HuificatorMessage, HuificatorResponse } from "../src/messages";

type Listener = (
    message: HuificatorMessage,
    sender: unknown,
    sendResponse: (response: HuificatorResponse) => void,
) => boolean | undefined;

const listeners: Listener[] = [];

/** Отправляет сообщение в content-скрипт и возвращает его ответ. */
const send = (message: HuificatorMessage): HuificatorResponse | undefined => {
    let response: HuificatorResponse | undefined;

    for (const listener of listeners) {
        listener(message, {}, (value) => {
            response = value;
        });
    }

    return response;
};

beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    listeners.length = 0;
    document.body.innerHTML = "";

    vi.stubGlobal("chrome", {
        runtime: {
            onMessage: {
                addListener: (listener: Listener) => listeners.push(listener),
            },
        },
    });

    await import("../src/content");
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("content-скрипт", () => {
    it("регистрирует слушатель сообщений", () => {
        expect(listeners).toHaveLength(1);
    });

    it("до старта сообщает, что выключен", () => {
        expect(send({ type: "huificator:status" })).toEqual({ enabled: false });
    });

    it("на старт отвечает enabled + already: false", () => {
        expect(send({ type: "huificator:start" })).toEqual({ enabled: true, already: false });
    });

    it("после старта сообщает, что включён", () => {
        send({ type: "huificator:start" });

        expect(send({ type: "huificator:status" })).toEqual({ enabled: true });
    });

    it("на повторный старт отвечает already: true", () => {
        send({ type: "huificator:start" });

        expect(send({ type: "huificator:start" })).toEqual({ enabled: true, already: true });
    });

    it("хуефицирует документ по таймеру после старта", () => {
        document.body.innerHTML = "<p>Игра</p>";

        send({ type: "huificator:start" });
        vi.advanceTimersByTime(1000);

        expect(document.querySelector("p")?.textContent).toBe("Игра-хуигра");
    });

    it("не трогает заголовок документа и содержимое script/style", () => {
        document.title = "дом";
        document.body.innerHTML = "<script>const a = 'дом';</script><p>дом</p>";

        send({ type: "huificator:start" });
        vi.advanceTimersByTime(1000);

        expect(document.title).toBe("дом");
        expect(document.querySelector("script")?.textContent).toBe("const a = 'дом';");
        expect(document.querySelector("p")?.textContent).toBe("дом-хуем");
    });

    it("ничего не делает до старта", () => {
        document.body.innerHTML = "<p>дом</p>";

        vi.advanceTimersByTime(5000);

        expect(document.querySelector("p")?.textContent).toBe("дом");
    });

    it("игнорирует неизвестные сообщения", () => {
        expect(send({ type: "huificator:nope" } as HuificatorMessage)).toBeUndefined();
    });
});
