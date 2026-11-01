// @ts-check
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end testing configuration
 * 
 * Starts the isolated FastAPI test server 
 * and React development server automatically.
 */

const FRONTEND_URL = "http://127.0.0.1:5173";
const BACKEND_URL = "http://127.0.0.1:8001";

export default defineConfig({
  testDir: "./tests/e2e",

  // Keep database-dependent tests sequential
  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],

  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use : {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: [
    {
      // Start FastAPI with the in-memory database.
      command:
        "python ../backEnd/tests/e2e_server.py",
      
        url: BACKEND_URL,
        name: "Test Backend",

        reuseExistingServer: false,
        timeout: 120_000,
    },
    {
      // Start React and point its API requests
      // to the isolated FastAPI server.
      command:
        "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",

        url: FRONTEND_URL,
        name: "Test Frontend",

        env: {
          ...process.env,
          VITE_API_BASE_URL: BACKEND_URL,
        },

        reuseExistingServer: false,
        timeout: 120_000,
    },
  ],
});