import { defineConfig } from '@playwright/test'

const AUTH_WEB_PORT = 5180
const AUTH_API_PORT = 3002
const VIEWER_PORT = 5173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${AUTH_WEB_PORT}`,
  },
  webServer: [
    {
      command: 'npm start',
      cwd: '../api',
      url: `http://localhost:${AUTH_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(AUTH_API_PORT) },
    },
    {
      command: 'npm run dev',
      url: `http://localhost:${AUTH_WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        AUTH_API_PORT: String(AUTH_API_PORT),
        VITE_VIEWER_URL: `http://localhost:${VIEWER_PORT}`,
      },
    },
  ],
})
