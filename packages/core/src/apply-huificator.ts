import { DEFAULT_PREFIX } from "./alphabet.js";
import { huefy } from "./huefy.js";

/** Кириллические слова, только их и трогаем. */
const WORD_PATTERN = /[а-яА-ЯёЁ]+/g;

/** Элементы, внутри которых текст — не контент страницы. */
const NON_CONTENT_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "TITLE", "TEMPLATE"]);

/** Последний текст, который мы записали в каждую ноду. */
const appliedText = new WeakMap<Text, string>();

const isSkipped = (node: Text): boolean => {
    const tag = node.parentElement?.tagName.toUpperCase();

    return tag !== undefined && NON_CONTENT_TAGS.has(tag);
};

/**
 * Один проход по текстовым нодам: хуефицирует кириллические слова.
 *
 * Нода перерисовывается только если её текст изменился снаружи после прошлой
 * обработки — это защищает от повторного наращивания суффикса и лишних записей
 * в DOM при вызове по таймеру.
 *
 * @param prefix приставка, передаётся в {@link huefy}
 * @param root корень обхода
 * @returns сколько текстовых нод реально изменилось
 */
export function applyHuificator(prefix: string = DEFAULT_PREFIX, root: Node = document): number {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let changed = 0;

    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        if (!(node instanceof Text)) continue;
        if (isSkipped(node)) continue;

        const current = node.data;

        if (appliedText.get(node) === current) continue;

        const next = current.replace(WORD_PATTERN, (word) => huefy(word, prefix));

        appliedText.set(node, next);

        if (next !== current) {
            node.data = next;
            changed += 1;
        }
    }

    return changed;
}
