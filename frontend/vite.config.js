import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base path MUST match your GitHub repo name: 'dsr'
export default defineConfig({
  plugins: [react()],
  base: "/dsr/"
});
