import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'expo-image-manipulator': path.resolve(__dirname, '__mocks__', 'expo-image-manipulator.ts'),
      'expo-file-system': path.resolve(__dirname, '__mocks__', 'expo-file-system.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
});
