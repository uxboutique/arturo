import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * `<!--#include partials/name.html -->` in an HTML entry is replaced with
 * that file, so the landing and the tool page share one copy of the demo.
 */
function htmlIncludes(): Plugin {
  const pattern = /<!--#include\s+([\w./-]+)\s*-->/g;
  return {
    name: 'html-includes',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(pattern, (_, file: string) => readFileSync(resolve(root, file), 'utf8'));
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('/partials/')) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  // Relative URLs so the build works under GitHub Pages' /arturo/ subpath
  // as well as on a custom domain root.
  base: './',
  plugins: [htmlIncludes()],
  build: {
    target: 'es2022',
    // Keep small SVG icons as separate cacheable files instead of inlining
    // dozens of data URIs into the CSS/HTML.
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        app: resolve(root, 'app/index.html'),
      },
    },
  },
});
