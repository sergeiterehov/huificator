import { defineConfig } from "vite";

/**
 * Проход 1: страницы расширения (popup) как обычные HTML/ESM-энтри.
 * Манифест и иконка лежат в `public/` и копируются как есть.
 */
export default defineConfig({
    publicDir: "public",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        target: "chrome88",
        // MV3 CSP запрещает инлайн-скрипты, а Vite по умолчанию вставляет
        // инлайн-полифилл modulepreload в HTML — из-за него попап перестанет
        // работать. Отключаем.
        modulePreload: { polyfill: false },
        rollupOptions: {
            input: { popup: "popup.html" },
            // Фиксированные имена без хешей: так проще сверять `dist`
            // с тем, что ожидает манифест.
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
