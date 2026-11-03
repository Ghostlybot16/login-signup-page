// @ts-check

import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

/**
 * Negative-path authentication tests.
 * 
 * These tests verify that failed login and 
 * registration attempts are handled safely.
 * 
 * All requests use the isolated FastAPI server
 * and its temporary SQLite database.
 */

const BACKEND_URL = "http://127.0.0.1:8001";
const FRONTEND_URL = "http://127.0.0.1:5173";

/**
 * @typedef {Object} TestUser
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 */


/**
 * Create unique credentials for each test.
 * 
 * @returns {TestUser}
 */
function createTestUser() {
    return {
        firstName: "Monkey",
        lastName: "Luffy",
        email: `luffy+${randomUUID()}@example.com`,
        password: "OnePiece123!",
    };
}

/**
 * Register a user directly through the test API.
 * 
 * This prepares the database for browser tests
 * without interacting with the signup page. 
 * 
 * @param {import("@playwright/test").APIRequestContext} request
 * @param {TestUser} user
 * @returns {Promise<void>}
 */
async function registerTestUser(request, user) {
    const response = await request.post(
        `${BACKEND_URL}/api/users/signup`,
        {
            data: {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                password: user.password,
            },
        }
    );

    expect(response.status()).toBe(201);
}

test.describe("Authentication error handling", () => {
    test(
        "rejects login with an innocent password",
        async ({ page, request }) => {
            const user = createTestUser();

            // Arrange: create an existing account.
            await registerTestUser(request, user);

            // Act: attempt login with the wrong password.
            await page.goto("/login");

            await page.getByLabel("Email").fill(user.email);

            await page.locator(
                'input[type="password"]'
            ).fill("WrongPassword123!");

            const loginResponsePromise = page.waitForResponse(
                (response) =>
                    response.url().endsWith("/api/users/login") &&
                    response.request().method() === "POST"
            );

            await page.locator(
                'form button[type="submit"]'
            ).click();

            const response = await loginResponsePromise;

            // Assert: invalid credentials are rejected.
            expect(response.status()).toBe(401);

            // The user must remain on the login page.
            await expect(page).toHaveURL(
                `${FRONTEND_URL}/login`
            );

            // Failed authentication must not create
            // a stored access token.
            const token = await page.evaluate(() =>
                sessionStorage.getItem("token")
            );

            expect(token).toBeNull();
        }
    );

    test(
        "rejects registration with an existing email",
        async ({ page, request }) => {
            const user = createTestUser();

            // Arrange: register the email beforehand
            await registerTestUser(request, user);

            // Act: try to register the same email
            // through the React signup form
            await page.goto("/signup");

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

            await page.getByRole("checkbox").check();

            const signupResponsePromise = page.waitForResponse(
                (response) =>
                    response.url().endsWith("/api/users/signup") &&
                    response.request().method() === "POST"
            );

            await page.locator(
                'form button[type="submit"]'
            ).click();

            const response = await signupResponsePromise;

            // Assert: the backend rejects duplicate users.
            expect(response.status()).toBe(400);

            // Registration must not succeed or redirect.
            await expect(page).toHaveURL(
                `${FRONTEND_URL}/signup`
            );
        }
    );
});