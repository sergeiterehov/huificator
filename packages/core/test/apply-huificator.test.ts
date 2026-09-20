// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { applyHuificator } from "../src/apply-huificator.js";

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("applyHuificator", () => {
    it("проходит вложенные элементы", () => {
        document.body.innerHTML = "<div><p>дом</p><span>Привет</span></div>";

        applyHuificator();

        expect(document.querySelector("p")?.textContent).toBe("дом-хуем");
        expect(document.querySelector("span")?.textContent).toBe("Привет-хуивет");
    });

    it("покрывает элементы вне старого списка селектора", () => {
        // Раньше обход шёл по "div, span, text, tspan, button, pre, p, a",
        // поэтому h1/li/td в предыдущей версии не обрабатывались вообще.
        document.body.innerHTML = "<h1>Игра</h1><ul><li>дом</li></ul>";

        applyHuificator();

        expect(document.querySelector("h1")?.textContent).toBe("Игра-хуигра");
        expect(document.querySelector("li")?.textContent).toBe("дом-хуем");
    });

    it("не трогает script, style и textarea", () => {
        document.body.innerHTML = `
            <script>const word = "дом";</script>
            <style>.дом { color: red; }</style>
            <textarea>дом</textarea>
            <p>дом</p>
        `;

        applyHuificator();

        expect(document.querySelector("script")?.textContent).toBe('const word = "дом";');
        expect(document.querySelector("style")?.textContent).toBe(".дом { color: red; }");
        expect(document.querySelector("textarea")?.textContent).toBe("дом");
        expect(document.querySelector("p")?.textContent).toBe("дом-хуем");
    });

    it("не наращивает суффикс при повторных проходах", () => {
        document.body.innerHTML = "<p>дом</p>";
        const paragraph = document.querySelector("p");

        expect(applyHuificator()).toBeGreaterThan(0);
        expect(paragraph?.textContent).toBe("дом-хуем");

        expect(applyHuificator()).toBe(0);
        expect(paragraph?.textContent).toBe("дом-хуем");

        expect(applyHuificator()).toBe(0);
        expect(paragraph?.textContent).toBe("дом-хуем");
    });

    it("перехуефицирует, если страница вернула исходный текст", () => {
        document.body.innerHTML = "<p>дом</p>";
        const paragraph = document.querySelector("p");

        applyHuificator();
        paragraph!.textContent = "дом";

        expect(applyHuificator()).toBeGreaterThan(0);
        expect(paragraph?.textContent).toBe("дом-хуем");
    });

    it("использует переданную приставку", () => {
        document.body.innerHTML = "<p>дом</p>";

        applyHuificator("фу");

        expect(document.querySelector("p")?.textContent).toBe("дом-фуем");
    });

    it("обходит только указанный корень", () => {
        document.body.innerHTML = "<div id='a'>дом</div><div id='b'>дом</div>";

        applyHuificator("ху", document.getElementById("a")!);

        expect(document.getElementById("a")?.textContent).toBe("дом-хуем");
        expect(document.getElementById("b")?.textContent).toBe("дом");
    });

    it("не падает на пустом документе", () => {
        expect(applyHuificator()).toBe(0);
    });
});
