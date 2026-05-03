import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests/component',
  testMatch: '**/*.spec.tsx',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-ct', open: 'never' }]],
  timeout: 15_000,

  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        },
      },
      // Pin the API base URL so axios in components hits a deterministic
      // path. We mock all HTTP via page.route('**/depthchart/**', ...).
      define: {
        'import.meta.env.VITE_API_BASE': JSON.stringify(
          'http://api.test/api/sports/nfl/teams/TB/depthchart',
        ),
      },
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
