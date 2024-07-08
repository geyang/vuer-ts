/** @type {import('vite').UserConfig} */
import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { plugin as mdPlugin } from 'vite-plugin-markdown';
import dts from 'vite-plugin-dts';
import * as sass from 'sass';

export default defineConfig({
  plugins: [
    react(
      {
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }
    ),
    dts({
      insertTypesEntry: true,
    }),
    mdPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  root: "vuer",
  build: {
    outDir: resolve(__dirname, './dist'),
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false, // <-- this is the important part
    lib: {
      name: 'vuer',
      entry: {
        "index": resolve(__dirname, './vuer/index.tsx'),
        "websocket": resolve(__dirname, './vuer/html_components/contexts/websocket.tsx')
      },
      formats: [ 'es', 'cjs' ],
      fileName: (format, name) => `${name}.${format}.js`,
    },
    rollupOptions: {
      // These are the libraries that we do not want to include in our bundle.
      external: [
        'react', 'react-dom', 'styled-components',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled'
        },
      },
    },
  },
} satisfies UserConfig);
