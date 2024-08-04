import { build, UserConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react-swc';
import { cjsInterop } from 'vite-plugin-cjs-interop';
import * as path from 'node:path';
import * as sass from 'sass';

export default {
  plugins: [
    mdx(),
    react({
      devTarget: 'es2022',
      tsDecorators: true,
    }),
    cjsInterop({
      // List of CJS dependencies that require interop
      dependencies: ['react-helmet-async'],
    }),
  ],
  root: 'vuer',
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false, // <-- this is the important part
    lib: {
      name: 'vuer',
      entry: {
        index: path.resolve(__dirname, './vuer/index.tsx'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => {
        if (format == 'es') return `${name}.esm.js`;
        else return `${name}.${format}`;
      },
    },
    optimizeDeps: {
      include: ['react-helmet-async'],
    },
    rollupOptions: {
      // These are the libraries that we do not want to include in our bundle.
      // plus anything that requires a provider for globals.
      external: [
        'react',
        'react-dom',
        'react-helmet-async',

        // 'three',
        // '@react-three/fiber',
        // '@react-three/xr',
        // '@react-three/drei',

        // 'leva',
        // 'zustand',
        // 'zustand/middleware',
        // 'zustand/shallow',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'three': 'THREE',
        },
      },
    },
  },
} as UserConfig;
