import { defineConfig } from 'tsup';

const entries = [
  [{ 'di-tory': './src/index.ts' }, 'DiTory'], //
  [{ 'di-tory.proxy-tools': './src/proxy-tools.ts' }, 'DiToryProxy'], //
];

export default defineConfig(
  entries.map(([entry, globalName, options]) => ({
    entry,
    globalName,
    format: ['iife'],
    outExtension() {
      return {
        js: '.min.js',
      };
    },
    dts: true,
    minify: 'terser',
    splitting: false,
    sourcemap: true,
    outDir: 'dist',
    ...options,
  })),
);
