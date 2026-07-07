import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" is required so Capacitor loads assets from relative paths inside the APK.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist", emptyOutDir: true },
});
