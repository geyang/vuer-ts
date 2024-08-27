import { UserConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react-swc';
// @ts-ignore: types unavailable.
import { cjsInterop } from 'vite-plugin-cjs-interop';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import * as path from 'node:path';
// @ts-ignore
import pkg from './package.json';
import { resolve } from 'node:path';

export default {
  plugins: [
    mdx(),
    react({
      jsxImportSource: 'react',
      devTarget: 'esnext',
      tsDecorators: true,
    }),
    // This is to include css modules as part of the build
    // https://stackoverflow.com/a/71304592/1560241
    cssInjectedByJsPlugin(),
    cjsInterop({
      // List of CJS dependencies that require interop
      dependencies: [
        'r3f-perf',
        'node_modules/use-sync-external-store/shim',
        'eventemitter3',
        'use-http',
        'use-ssr',
        'urs',
        'buffer',
        'react-remark',
        'rehype-react',
      ],
    }),
    dts({ strictOutput: false }),
  ],
  root: 'src',
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  optimizeDeps: {
    // force: true,
    include: [
      'r3f-perf/*',
      'node_modules/use-sync-external-store/shim/*',
      'eventemitter3/*',
      'use-http/*',
      'use-ssr/*',
      'urs/*',
      'buffer/*',
      'react-remark/*',
      'rehype-react/*',
    ],
    exclude: [
      // 'three'
    ],
    external: [],
  },
  build: {
    outDir: resolve(__dirname, './dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: true, // <-- this is the important part
    sourceMap: true,
    lib: {
      name: '@vuer-ai/vuer',
      entry: {
        'index': resolve(__dirname, './src/index.tsx'),
      },
      //
      // formats: ['umd'],// ['es', 'cjs'],
      // fileName: (format, name) => {
      //   // we use js because this needs to run in the browser. mjs is not supported.
      //   if (format == 'umd') return `${name}.js`;
      //   else return `${name}.${format}`;
      // },
    },
    commonjsOptions: {
      // these are verified one by one.
      // include: [ ],
      transformMixedEsModules: true,
      // exclude: [
      //   /node_modules\/@vuer-ai\/vuer/,
      //   /node_modules\/lodash\.throttle/,
      // ]
    },
    rollupOptions: {
      external: [
        'react/jsx-runtime',
        'react-dom/client',
        'react-reconciler',
        ...Object.keys(pkg.peerDependencies),
      ],
      output: {
        /** this is to make sure css modules are included as part of a
         * single javascript file. */
        manualChunks: undefined,
        globals: {
          react: 'react',
          'react-dom': 'reactDOM',
          'react/jsx-runtime': 'jsx',
          'three': 'THREE',
        },
      },

    },

  },

} as UserConfig;
