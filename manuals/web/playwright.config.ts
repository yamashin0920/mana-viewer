import { defineConfig } from '@playwright/test'

const MANUALS_WEB_PORT = 5210

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${MANUALS_WEB_PORT}`,
  },
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${MANUALS_WEB_PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
