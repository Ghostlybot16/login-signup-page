// @ts-check

import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

/**
 * End-to-end authentication workflow tests.
 * 
 * Tests the complete user journey against:
 * - The React + Mantine frontend.
 * - The isolated FastAPI test backend.
 * - The temporary in-memory SQLite database.
 * 
 * No API requests are mocked: the application
 * communicates with the real test backend.
 */

test.describe('Complete authentication workflow', () => {
    test(
        "user can sign up, log in, view dashboard, and log out",
        async ({ page }) => {
            /**
             * Generate a unique email for every run.
             * 
             * This prevents registration conflicts if 
             * multiple tests run against the same server.
             * 
             * @type {{
             *     firstName: string,
             *     lastName: string,
             *     email: string,
             *     password: string
             * }}
             */
            const user = {
                firstName: "Monkey",
                lastName: "Luffy",
                email: `luffy+${randomUUID()}@example.com`,
                password: "OnePiece123!",
            };

            await test.step("Register a new account", async () => {
                await page.goto("/signup");

                // Complete the registration form.
                await page.getByLabel("First name").fill(
                    user.firstName
                );

                await page.getByLabel("Last name").fill(
                    user.lastName
                );

                await page.getByLabel("Email").fill(
                    user.email
                );

                await page.locator(
                    'input[type="password"]'
                ).fill(user.password);

                // Accept the required terms.
                await page.getByRole("checkbox").check();

                // Start waiting before submitting the form
                // so the API response cannot be missed.
                const signupResponsePromise = page.waitForResponse(
                    (response) =>
                        response.url().endsWith("/api/users/signup") &&
                        response.request().method() === "POST"
                );

                await page.locator(
                    'form button[type="submit"]'
                ).click();

                const signupResponse = await signupResponsePromise;

                expect(signupResponse.status()).toBe(201);

                // Successful registration redirects to login.
                // Check the path without relying on query strings.
                await expect(page).toHaveURL(
                    (url) => url.pathname === "/login"
                );
            });

            await test.step("Log in with the new account", async () => {
                await page.getByLabel("Email").fill(user.email);

                await page.locator(
                    'input[type="password"]'
                ).fill(user.password);

                const loginResponsePromise = page.waitForResponse(
                    (response) =>
                        response.url().endsWith("/api/users/login") &&
                        response.request().method() === "POST"
                );

                await page.locator(
                    'form button[type="submit"]'
                ).click();

                const loginResponse = await loginResponsePromise;

                expect(loginResponse.status()).toBe(200);

                await expect(page).toHaveURL(
                    "http://127.0.0.1:5173/dashboard"
                );
            });

            await test.step("Verify the dashboard", async () => {
                // Verify that the protected dashboard
                // displays the authenticated user's details.
                const main = page.getByRole("main");

                await expect(main).toBeVisible();

                await expect(main).toContainText(
                    "Monkey Luffy"
                );

                await expect(main).toContainText(
                    user.email
                );
            });

            await test.step("Log out", async () => {
                // Accept either common spelling of the 
                // logout button's accessible name
                const logoutButton = page
                    .getByRole("button", { name: "Log out", exact: true })
                    .or(
                        page.getByRole("button", {
                            name: "Logout",
                            exact: true,
                        })
                    );
                
                await logoutButton.click();

                await expect(page).toHaveURL(
                    "http://127.0.0.1:5173/login"
                );
            });

            await test.step(
                "Verify dashboard is protected after logout",
                async () => {
                    await page.goto("/dashboard");

                    await expect(page).toHaveURL(
                        "http://127.0.0.1:5173/login"
                    );
                }
            );
        }
    );
});