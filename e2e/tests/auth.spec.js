import { test, expect } from '@playwright/test';

test('AUTH-01: Login with valid Username/Password', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Reitti - Login');

    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit-button').click();
    await expect(page.locator('.navbar .nav-link.active')).toBeVisible();
});

test('AUTH-02: Redirect & Login via OIDC (Mocked)', async ({ page }) => {
    await page.goto('/login');

    // Listen for the request to Spring's OAuth2 authorization endpoint
    let request;
    await Promise.all([
        page.waitForRequest('**/oauth2/authorization/oauth*').then(req => {
            request = req;
        }),
        page.getByTestId('oauth-login-button').click()
    ]);

    // Verify the request was made to the correct Spring endpoint
    expect(request.url()).toBe('http://localhost:8080/oauth2/authorization/oauth');

    // Optional: Verify it's a GET request (standard for OAuth2 authorization)
    expect(request.method()).toBe('GET');

    // Optional: Log for debugging
    console.log('OAuth2 request made to:', request.url());
});
test('AUTH-03: Logout clears session', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-input').fill('admin');
    await page.getByTestId('password-input').fill('admin');
    await page.getByTestId('login-submit-button').click();
    await expect(page.locator('.navbar .nav-link.active')).toBeVisible();
    await page.getByTestId('logout-button').click();
    await page.goto('/'); //try to load the start page after logout
    await expect(page).toHaveURL('/login')
});

test('AUTH-04: Display message on invalid user name', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('user123');
    await page.getByTestId('password-input').fill('pass123');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByTestId('login-error-msg')).toHaveText('Invalid username or password');
});