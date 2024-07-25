/** @type {import('vite').UserConfig} */
import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { plugin as mdPlugin } from 'vite-plugin-markdown';
import dts from 'vite-plugin-dts';
import * as sass from 'sass';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          '@emotion/babel-plugin',
          ['module:@preact/signals-react-transform', {mode: 'all'}],
        ],
      },
    }),
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
  root: 'vuer',
  build: {
    outDir: resolve(__dirname, './dist'),
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false, // <-- this is the important part
    lib: {
      name: 'vuer',
      entry: {
        index: resolve(__dirname, './vuer/index.tsx'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => {
        if (format == 'es') return `${name}.esm.js`;
        else return `${name}.${format}`;
      },
    },
    rollupOptions: {
      // These are the libraries that we do not want to include in our bundle.
      // plus anything that requires a provider for globals.
      external: [
        'react',
        'react-dom',
        'styled-components',
        'three',
        '@preact/signals-react',
        '@preact/signals-core',
        '@react-three/fiber',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
} satisfies UserConfig);
