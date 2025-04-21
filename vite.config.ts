import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        main: resolve(__dirname, 'src/main.ts'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        options: resolve(__dirname, 'options/options.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name === 'options' ? 'options/' : 'src/'}${chunkInfo.name}.js`;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
