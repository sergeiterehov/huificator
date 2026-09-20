import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["packages/*/test/**/*.test.ts"],
        // Отдельные файлы переключают окружение на jsdom через `@vitest-environment`
        environment: "node",
    },
});
