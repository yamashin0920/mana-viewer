import { defineConfig } from '@playwright/test'

const LMS_WEB_PORT = 5200
const AUTH_WEB_PORT = 5180
const AUTH_API_PORT = 3002
const MOCK_API_PORT = 3001
const VIEWER_PORT = 5173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${LMS_WEB_PORT}`,
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
      env: { PORT: String(MOCK_API_PORT), VIEWER_URL: `http://localhost:${VIEWER_PORT}` },
    },
    {
      command: 'npm run dev',
      cwd: '../../auth/web',
      url: `http://localhost:${AUTH_WEB_PORT}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        AUTH_API_PORT: String(AUTH_API_PORT),
        VITE_VIEWER_URL: `http://localhost:${VIEWER_PORT}`,
      },
    },
    {
      command: 'npm run dev',
      cwd: '../../viewer',
      url: `http://localhost:${VIEWER_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        MOCK_API_PORT: String(MOCK_API_PORT),
        VITE_AUTH_APP_URL: `http://localhost:${AUTH_WEB_PORT}`,
        VITE_LMS_APP_URL: `http://localhost:${LMS_WEB_PORT}`,
      },
    },
    {
      command: 'npm run dev',
      url: `http://localhost:${LMS_WEB_PORT}/courses`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        AUTH_API_PORT: String(AUTH_API_PORT),
        MOCK_API_PORT: String(MOCK_API_PORT),
        VITE_AUTH_APP_URL: `http://localhost:${AUTH_WEB_PORT}`,
        VITE_VIEWER_URL: `http://localhost:${VIEWER_PORT}`,
      },
    },
  ],
})
