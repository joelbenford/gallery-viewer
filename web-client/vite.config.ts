import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Explicitly tell the server to route through our main.tsx file
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/main.tsx"),
      },
    },
  },
});
