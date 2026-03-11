import { test, expect } from '@playwright/test';

test('AUTH-01: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/dashboard');
});

test('AUTH-02: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/dashboard');
});

test('AUTH-03: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/dashboard');
});