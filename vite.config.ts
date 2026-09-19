import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match your GitHub repo name for GitHub Pages to load assets correctly.
// e.g. if your repo is github.com/yourname/Lea-Fakatonga, base should be "/Lea-Fakatonga/"
export default defineConfig({
  plugins: [react()],
  base: "/Lea-Fakatonga/",
});
