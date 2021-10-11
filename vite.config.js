import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    if (command === "serve") {
        return {
            // serve specific config
        };
    } else {
        return {
            // build specific config
            base: "",
        };
    }
});
