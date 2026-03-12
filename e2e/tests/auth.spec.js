import { test, expect } from '@playwright/test';

test('AUTH-01: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Reitti - Login');

    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit-button').click();
    await expect(page.locator('.navbar .nav-link.active')).toBeVisible();
});

test('AUTH-02: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL('/dashboard');
});

test('AUTH-03: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit-button').click();
    await expect(page).toHaveURL('/dashboard');
});