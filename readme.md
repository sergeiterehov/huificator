# Хуификатор

Хуефицирует кириллические слова: к слову добавляется приставка с заменённой
последней гласной основы.

```
дом    → дом-хуем
Дама   → Дама-хуяма
Игра   → Игра-хуигра
ПРИВЕТ → ПРИВЕТ-хуиВЕТ
```

Слова короче трёх букв, слова без гласных и не-кириллица остаются как есть.
Регистр на работу не влияет, хвост слова сохраняет исходный регистр.

## Пакет

Ядро — [`packages/core`](packages/core), публикуется в npm как `huificator`:

```
npm i huificator
```

## Пример использования

```js
import { applyHuificator, huefy } from "huificator";

huefy("Игра");                               // "Игра-хуигра"

applyHuificator();                           // один проход по документу
setInterval(() => applyHuificator(), 1000);  // или по таймеру
```

`applyHuificator(prefix?, root?)` возвращает число изменённых нод, не трогает
`script`, `style`, `noscript`, `textarea`, `title` и не переписывает ноду, если
её текст не менялся с прошлого прохода.

В версии 2.0 убран глобал `window.__huificator` из 1.x — остался только ESM-импорт.

## Расширение для Chrome

В репозитории также лежит расширение — [`packages/extension`](packages/extension):
[Журбанизатор](https://chromewebstore.google.com/detail/%D0%B6%D1%83%D1%80%D0%B1%D0%B0%D0%BD%D0%B8%D0%B7%D0%B0%D1%82%D0%BE%D1%80/jdepnicbmmhkckeodgfklnjoaahelpia)
в Chrome Web Store.

## Разработка

```
npm install
npm test        # vitest: алгоритм, обход DOM, протокол расширения
npm run build   # ядро, затем расширение
```
