import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs so the build works under GitHub Pages' /arturo/ subpath
  // as well as on a custom domain root.
  base: './',
  build: {
    target: 'es2022',
    // Keep small SVG icons as separate cacheable files instead of inlining
    // dozens of data URIs into the CSS/HTML.
    assetsInlineLimit: 0,
  },
});
