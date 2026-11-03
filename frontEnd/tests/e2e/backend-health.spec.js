// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Verify that Playwright can communicate
 * with the isolated FastAPI test backend.
 */
test("isolated backend responds successfully", async ({ request }) => {
    const response = await request.get(
        "http://127.0.0.1:8001/"
    );

    expect(response.status()).toBe(200);

    expect(await response.json()).toEqual({
        message: "Backend is running successfully!",
    });
});