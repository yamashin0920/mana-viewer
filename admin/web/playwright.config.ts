import { defineConfig } from '@playwright/test'

const ADMIN_WEB_PORT = 5190
const AUTH_API_PORT = 3002
const MOCK_API_PORT = 3001

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${ADMIN_WEB_PORT}`,
  },
  webServer: [
    {
      command: 'npm start',
      cwd: '../../auth/api',
      url: `http://localhost:${AUTH_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(AUTH_API_PORT) },
    },
    {
      command: 'npm start',
      cwd: '../../mock-api',
      url: `http://localhost:${MOCK_API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: String(MOCK_API_PORT) },
    },
    {
      command: 'npm run dev',
      url: `http://localhost:${ADMIN_WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        AUTH_API_PORT: String(AUTH_API_PORT),
        MOCK_API_PORT: String(MOCK_API_PORT),
      },
    },
  ],
})
