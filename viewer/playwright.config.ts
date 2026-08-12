import { defineConfig, devices } from '@playwright/test'

const VIEWER_PORT = 5173
const MOCK_API_PORT = 3001
const AUTH_API_PORT = 3002
const AUTH_WEB_PORT = 5180

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${VIEWER_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'npm start',
      cwd: '../auth/api',
      url: `http://localhost:${AUTH_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(AUTH_API_PORT) },
    },
    {
      command: 'npm start',
      cwd: '../mock-api',
      url: `http://localhost:${MOCK_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      cwd: '../auth/web',
      url: `http://localhost:${AUTH_WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        AUTH_API_PORT: String(AUTH_API_PORT),
        VITE_VIEWER_URL: `http://localhost:${VIEWER_PORT}`,
      },
    },
    {
      command: 'npm run dev',
      url: `http://localhost:${VIEWER_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
