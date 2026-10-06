import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // En GitHub Pages la web vive en /nombre-del-repo/ (lo define el workflow con VITE_BASE).
  base: process.env.VITE_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5190,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:8010",
    },
  },
});
