import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['test/**/*.test.ts'],
  testEnvironment: 'node',
});