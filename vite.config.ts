import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/voltz-aprender-eletricidade/",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
