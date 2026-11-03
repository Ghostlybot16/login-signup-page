
 // @ts-check
import { test, expect } from "@playwright/test";

/**
 * Authentication page smoke tests.
 *
 * These tests verify that the public authentication
 * pages render correctly and that unauthenticated
 * users cannot access the protected dashboard.
 *
 * These tests do not submit authentication forms
 * or require a running FastAPI backend.
 */
test.describe("Authentication page navigation", () => {

    test("login page renders correctly", async ({ page }) => {
        
        // Navigate to the login page.
        await page.goto("/login");

        // Confirm that the browser reached the login route.
        await expect(page).toHaveURL(
            "http://127.0.0.1:5173/login"
        );

        // Verify that the main page content is visible.
        await expect(
            page.getByRole("main")
        ).toBeVisible();
    });

    test("signup page renders correctly", async ({ page }) => {
        // Navigate to the signup page.
        await page.goto("/signup");

        // Confirm that the browser reached the signup route.
        await expect(page).toHaveURL(
            "http://127.0.0.1:5173/signup"
        );

        // Verify that the main page content is visible.
        await expect(
            page.getByRole("main")
        ).toBeVisible();
    });

    test(
        "dashboard redirects unauthenticated users",
        async ({ page }) => {
            // Each test uses an isolated browser context
            // without an existing authentication token.
            await page.goto("/dashboard");

            // Unauthenticated visitors should be
            // redirected to the login page.
            await expect(page).toHaveURL(
                "http://127.0.0.1:5173/login"
            );
        }
    );
});