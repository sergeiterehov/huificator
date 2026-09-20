import { describe, expect, it } from "vitest";
import { DEFAULT_PREFIX, VOWEL_MAP } from "../src/alphabet.js";
import { huefy } from "../src/huefy.js";

describe("huefy: слова, которые не трогаем", () => {
    it.each(["", "а", "не", "ъ", "hello", "ab"])("оставляет %j без изменений", (word) => {
        expect(huefy(word)).toBe(word);
    });

    it("не падает и не меняет слово без гласных", () => {
        expect(huefy("брр")).toBe("брр");
    });
});

describe("huefy: хуефикация", () => {
    it.each([
        ["дом", "дом-хуем"],
        ["привет", "привет-хуивет"],
        ["ёлка", "ёлка-хуелка"],
        ["апельсин", "апельсин-хуельсин"],
        ["Привет", "Привет-хуивет"],
        ["Мама", "Мама-хуяма"],
        ["Апельсин", "Апельсин-хуельсин"],
        ["Игра", "Игра-хуигра"],
        ["Окно", "Окно-хуекно"],
        ["Это", "Это-хуето"],
        ["Ёлка", "Ёлка-хуелка"],
        ["Улица", "Улица-хуюлица"],
        ["История", "История-хуистория"],
        ["МАМА", "МАМА-хуяМА"],
        ["ПРИВЕТ", "ПРИВЕТ-хуиВЕТ"],
    ])("%s → %s", (word, expected) => {
        expect(huefy(word)).toBe(expected);
    });

    it("использует переданную приставку", () => {
        expect(huefy("дом", "фу")).toBe("дом-фуем");
    });

    it("по умолчанию приставка — DEFAULT_PREFIX", () => {
        expect(DEFAULT_PREFIX).toBe("ху");
        expect(huefy("дом")).toBe("дом-хуем");
    });

    it("хвост слова сохраняет исходный регистр", () => {
        expect(huefy("МАМА").endsWith("МА")).toBe(true);
    });
});

describe("huefy: регрессия на регистр", () => {
    // До фикса индексы искались по исходной строке регистрозависимо, поэтому
    // слова с заглавной гласной основы возвращались без изменений.
    it.each(["Игра", "Окно", "Это", "Ёлка", "МАМА", "ПРИВЕТ", "Улица", "История"])(
        "меняет слово с заглавной гласной: %s",
        (word) => {
            expect(huefy(word)).not.toBe(word);
        },
    );

    it("даёт одинаковый результат для строчной и заглавной гласной основы", () => {
        expect(huefy("ёлка")).toBe("ёлка-хуелка");
        expect(huefy("Ёлка")).toBe("Ёлка-хуелка");
    });

    it("регистр не влияет на длину хвоста", () => {
        const lower = huefy("привет");
        const upper = huefy("ПРИВЕТ");

        expect(lower.replace("ху", "").length).toBe(upper.replace("ху", "").length);
    });
});

describe("алфавит", () => {
    it("содержит все 10 гласных и 21 согласную", () => {
        expect(Object.keys(VOWEL_MAP)).toHaveLength(10);
        expect(new Set(Object.keys(VOWEL_MAP)).size).toBe(10);
    });

    it("все значения VOWEL_MAP — непустые строки", () => {
        for (const [vowel, replacement] of Object.entries(VOWEL_MAP)) {
            expect(replacement, `замена для ${vowel}`).toMatch(/^[а-яё]$/);
        }
    });
});
