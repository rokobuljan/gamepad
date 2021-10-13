import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    console.log(command);
    if (command === "serve") {
        return {
            server: {
                // port: "5001",
                host: true
            }
        };
    } else {
        return {
            // build specific config
            base: "",
        };
    }
});
