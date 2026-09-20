import { CONSONANTS, DEFAULT_PREFIX, VOWELS, VOWEL_MAP } from "./alphabet.js";

/**
 * Первый индекс любого символа из набора, или `Infinity`, если ничего не найдено.
 *
 * Заменяет `Math.min(...chars.map((c) => s.indexOf(c)).filter((i) => i >= 0))`:
 * результат тот же (в том числе `Infinity` для пустого набора), но без
 * промежуточного массива.
 */
const firstIndexOfAny = (haystack: string, needles: readonly string[]): number => {
    let found = Infinity;

    for (const needle of needles) {
        const index = haystack.indexOf(needle);

        if (index >= 0 && index < found) found = index;
    }

    return found;
};

/**
 * Последний индекс любого символа из набора, или `-1`, если ничего не найдено.
 *
 * Заменяет `Math.max(...chars.map((c) => s.lastIndexOf(c)))`.
 */
const lastIndexOfAny = (haystack: string, needles: readonly string[]): number => {
    let found = -1;

    for (const needle of needles) {
        const index = haystack.lastIndexOf(needle);

        if (index > found) found = index;
    }

    return found;
};

/**
 * Добавляет к слову приставку с заменённой последней гласной основы.
 *
 * Регистр не влияет на работу: все индексы считаются по копии в нижнем регистре
 * (в кириллице регистр не меняет длину строки), а срезы берутся из исходного
 * слова — поэтому хвост сохраняет регистр оригинала.
 *
 * @param src слово целиком
 * @param prefix приставка перед заменённой гласной
 * @returns изменённое слово, либо `src` без изменений — если слово короче трёх
 *          символов, в нём нет гласных, или для найденной гласной нет замены
 */
export function huefy(src: string, prefix: string = DEFAULT_PREFIX): string {
    if (src.length < 3) return src;

    const lower = src.toLowerCase();

    // Пропускаем начальные согласные
    let ending = lower.slice(firstIndexOfAny(lower, VOWELS));

    // Берем окончание
    ending = ending.slice(ending.length < 5 ? -3 : -5);

    // Сокращаем окончание до первой согласной
    ending = ending.slice(firstIndexOfAny(ending, CONSONANTS));

    const base = src.slice(0, src.length - ending.length);
    const vowelIndex = lastIndexOfAny(base.toLowerCase(), VOWELS);

    if (vowelIndex < 0) return src;

    const vowel = lower[vowelIndex];

    if (vowel === undefined) return src;

    const replacement = VOWEL_MAP[vowel];

    if (replacement === undefined) return src;

    return `${src}-${prefix}${replacement}${src.slice(vowelIndex + 1)}`;
}
