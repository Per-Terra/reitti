# End-to-End (E2E) Testing with Playwright

This guide explains how to run, debug, and create E2E tests for Reitti using Playwright. The target audience is developers with little to no experience with Playwright.

## Prerequisites

### Installing Node.js with NVM (Node Version Manager)

If you don't have Node.js installed, we recommend using NVM to manage Node.js versions:

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Restart your terminal or run:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 24+ (check for latest LTS version)
nvm install --lts

# Verify installation
node --version
npm --version
```

**Note**: The Playwright tests require Node.js 24 or higher. Using NVM makes it easy to switch between Node.js versions if needed.

- Node.js 24+ installed
- Docker and Docker Compose installed
- Maven installed (for building the application)

## Quick Start

### 1. Install Dependencies

```bash
# Install Playwright and its dependencies
cd e2e
npm install
# Install Playwright browsers
npx playwright install
```

### 2. Build Local Images

Before running tests against your local changes, you need to build the Docker images:

```bash
# Build the Reitti application
mvn clean package
docker build -t dedicatedcode/reitti:latest .

# Build the tile cache service
cd docker/tiles-cache
docker build -t dedicatedcode/tiles-cache:latest .
cd ../..
```

### 3. Start the Test Environment

Use the CI docker-compose file to start the latest local version of the app:

```bash
# Start all services (PostgreSQL, Redis, Reitti, etc.)
docker compose -f docker-compose.ci.yml up -d
```

Wait for all services to be healthy. You can check the status with:

```bash
docker compose -f docker-compose.ci.yml ps
```

### 4. Run All Tests

```bash
# Run all E2E tests
npm test
```

### 5. Clean Up

```bash
# Stop and remove all containers
docker compose -f docker-compose.ci.yml down -v
```

## Test ID System and Coverage Verification

Reitti uses a structured test ID system to ensure comprehensive test coverage. This system is enforced by a verification script that runs in CI.

### How the Test ID System Works

1. **Test IDs are defined in documentation files** in `docs/testing/` (e.g., `docs/testing/authenticaion.md`)
2. **Each test ID must have a corresponding test** in the Playwright test files
3. **Test names must start with the Test ID** (e.g., `AUTH-01: Login with valid Username/Password`)

Example from `docs/testing/authenticaion.md`:
```
| Test ID     | Requirement                               | Category | Playwright Test File     |
|-------------|-------------------------------------------|----------|--------------------------|
| **AUTH-01** | Standard Username/Password Login          | Auth     | `e2e/tests/auth.spec.js` |
| **AUTH-02** | Redirect & Login via OIDC (Mocked)        | Auth     | `e2e/tests/auth.spec.js` |
| **AUTH-03** | Logout clears session & redirects to Home | Auth     | `e2e/tests/auth.spec.js` |
```

Corresponding test in `e2e/tests/auth.spec.js`:
```javascript
test('AUTH-01: Login with valid Username/Password', async ({ page }) => {
    // Test implementation
});

test('AUTH-02: Redirect & Login via OIDC (Mocked)', async ({ page }) => {
    // Test implementation
});

test('AUTH-03: Logout clears session & redirects to Home', async ({ page }) => {
    // Test implementation
});
```

### Coverage Verification Script

The `e2e/scripts/verify-coverage.js` script automatically checks that:
1. Every Test ID mentioned in `docs/testing/` files exists in the test code
2. The CI build will fail if any Test ID is missing

**To verify coverage locally before committing:**
```bash
cd e2e
node scripts/verify-coverage.js
```

If the script finds missing tests, it will output:
```
❌ Missing test implementation for: AUTH-02, AUTH-03
```

### Creating New Tests with Proper Test IDs

When adding a new test:

1. **First, add the Test ID to documentation** in the appropriate `docs/testing/` file
2. **Then create the test** with a name starting with that Test ID
3. **Run the verification script** to ensure coverage is complete

Example workflow for adding a new authentication test:
1. Add `| **AUTH-04** | Login with invalid credentials shows error | Auth | e2e/tests/auth.spec.js |` to `docs/testing/authenticaion.md`
2. Create the test in `auth.spec.js`:
   ```javascript
   test('AUTH-04: Login with invalid credentials shows error', async ({ page }) => {
       // Test implementation
   });
   ```
3. Run `node scripts/verify-coverage.js` to verify

## Test Development Workflow

### Creating New Tests with Playwright UI

Playwright provides a visual UI that makes test creation easy for beginners:

#### 1. Start the Playwright UI

```bash
# Open the Playwright Test Runner UI
npx playwright test --ui
```

This opens a browser-based UI where you can:
- See all test files
- Run individual tests
- Record new tests
- Debug tests step-by-step

#### 2. Record a New Test

1. Click the "Record new" button in the UI
2. Select "Test" to create a new test file or "Add to existing" to extend a file
3. Choose a browser (Chrome, Firefox, or Safari)
4. A browser window will open - navigate to `http://localhost:8080`
5. Perform the actions you want to test (click, type, navigate)
6. Playwright will automatically record your actions as test code
7. Click "Save" to save the test

#### 3. Edit and Enhance Recorded Tests

The recorded code will look something like this:

```javascript
test('AUTH-01: Login with valid Username/Password', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByLabel('Username').click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
});
```

You can enhance this by:
- Adding assertions to verify results
- Using test IDs for more reliable selectors
- Adding comments
- Organizing with `describe` blocks

### Best Practices for Test Creation

1. **Use Test IDs**: Add `data-testid` attributes to your HTML elements and use them in tests:
   ```javascript
   // In your Thymeleaf template:
   <button data-testid="login-button">Login</button>
   
   // In your test:
   await page.getByTestId('login-button').click();
   ```

2. **Keep Tests Independent**: Each test should set up its own state and clean up after itself.

3. **Use Page Objects**: For complex pages, create page object classes to organize selectors and actions.

4. **Add Meaningful Assertions**: Always verify that actions produce the expected results.

## Debugging Tests

### 1. Using Playwright UI

The Playwright UI is the easiest way to debug:

```bash
npx playwright test --ui
```

In the UI you can:
- Run tests and see failures immediately
- Click on any step to see what happened
- View screenshots and videos of failed tests
- Use the "Pick locator" tool to find selectors

### 2. Debug Mode

Run tests in debug mode to step through them:

```bash
# Run a specific test in debug mode
npx playwright test auth.spec.js --debug
```

This opens the Playwright Inspector where you can:
- Pause execution
- Step through commands
- Inspect the page at any point
- Execute commands in the console

### 3. Generate Traces

For complex failures, generate trace files:

```bash
# Run with tracing enabled
npx playwright test --trace on
```

After a test fails, you can open the trace file:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

The trace viewer shows:
- A timeline of actions
- Screenshots at each step
- Network requests
- Console logs

### 4. Common Debugging Tips

1. **Check the Application Logs**:
   ```bash
   docker compose -f docker-compose.ci.yml logs reitti
   ```

2. **Take Screenshots on Failure** (already configured in `playwright.config.js`):
   ```javascript
   // Screenshots are automatically saved on failure
   ```

3. **Add Manual Timeouts for Debugging**:
   ```javascript
   await page.waitForTimeout(5000); // Pause for 5 seconds
   ```

4. **Use Console Logs**:
   ```javascript
   console.log('Current URL:', page.url());
   ```

## Test Structure

```
e2e/
├── tests/                    # Test files
│   ├── auth.spec.js         # Authentication tests
│   ├── main.spec.js         # Main page tests
│   └── ...                  # Other test files
├── fixtures/                # Test data and fixtures
├── mocks/                   # WireMock configurations
├── scripts/
│   └── verify-coverage.js   # Test coverage verification
├── docker-compose.ci.yml    # Test environment setup
└── playwright.config.js     # Playwright configuration
```

## Running Specific Tests

```bash
# Run a single test file
npx playwright test tests/auth.spec.js

# Run tests with a specific tag
npx playwright test --grep "@smoke"

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Continuous Integration

The tests are configured to run in CI environments. The `docker-compose.ci.yml` file sets up:

- Reitti with your local build
- PostgreSQL with PostGIS
- Redis for caching
- WireMock for external service mocking
- Tile cache service

**Important**: The CI build will fail if the `verify-coverage.js` script detects any missing tests. Always run this script locally before pushing changes.

## Troubleshooting

### "Connection refused" errors
Make sure all Docker containers are running:
```bash
docker compose -f docker-compose.ci.yml ps
```

### "Element not found" errors
1. Check if the application is fully loaded
2. Verify you're using the correct selectors
3. Add `await page.waitForLoadState('networkidle')` before interacting

### Tests are flaky
1. Use `page.waitForSelector()` instead of fixed timeouts
2. Add retry logic for unstable elements
3. Check for race conditions in the application

### Playwright browsers won't install
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
npx playwright install
```

### Coverage verification fails
If `node scripts/verify-coverage.js` fails:
1. Check that all Test IDs from `docs/testing/` files exist in test files
2. Ensure test names start with the exact Test ID (e.g., `AUTH-01: ...`)
3. Run the verification script to see which IDs are missing

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Playwright Debugging Guide](https://playwright.dev/docs/debug)