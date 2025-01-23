import { defineConfig } from "vite";

const commonConfig = {
    root: "example",
    build: {
        outDir: "../dist",
    },
};

export default defineConfig(({ command, mode }) => {
    console.log(`Vite running mode: ${command}`);
    if (command === "serve") {
        return {
            ...commonConfig,
            server: {
                host: true,
            },
        };
    } else {
        return {
            // build specific config
            ...commonConfig,
            base: "",
        };
    }
});
