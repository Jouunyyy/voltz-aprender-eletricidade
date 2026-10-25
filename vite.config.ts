import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VOLTZ_BASE || "/voltz-aprender-eletricidade/",
  plugins: [react()],
  build: { rolldownOptions: { input: { main: path.resolve(__dirname, 'index.html'), circuits: path.resolve(__dirname, 'circuitos-cartoon.html'), support: path.resolve(__dirname, 'apoio.html') } } },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
