import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: true,
        port: 3000,
        open: false, // Automatically open in the browser
    },
});
