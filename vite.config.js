import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Astronom-a-aficionada/" : "/",
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("postprocessing")) return "postprocessing";
          if (id.includes("@react-three") || id.includes("/three/")) return "three";
          if (id.includes("gsap")) return "gsap";
          if (id.includes("framer-motion") || id.includes("/motion-")) return "motion";
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          return undefined;
        },
      },
    },
  },
}));
