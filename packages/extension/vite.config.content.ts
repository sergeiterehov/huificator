import { defineConfig } from "vite";

/**
 * Проход 2: content-скрипт.
 *
 * В MV3 файлы из `content_scripts.js` — классические скрипты: ES-модули и
 * code-splitting там запрещены. Поэтому собираем отдельным проходом как IIFE
 * в один файл с фиксированным именем `index.js`, на который ссылается
 * manifest.json.
 */
export default defineConfig({
    publicDir: false,
    build: {
        outDir: "dist",
        // Не затираем результат первого прохода
        emptyOutDir: false,
        copyPublicDir: false,
        target: "chrome88",
        lib: {
            entry: "src/content.ts",
            name: "huificatorContent",
            formats: ["iife"],
            fileName: () => "index.js",
        },
    },
});
