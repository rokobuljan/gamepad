import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "dist/lib",
        target: "es2022",
        sourcemap: true,
        lib: {
            entry: "gamepad.js",
            formats: ["es"],
            fileName: () => "gamepad.js",
        },
    },
});
