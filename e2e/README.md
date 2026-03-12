# End-to-End (E2E) Testing with Playwright

This guide explains how to run, debug, and create E2E tests for Reitti using Playwright. The target audience is developers with little to no experience with Playwright.

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- Maven installed (for building the application)

## Quick Start

### 1. Install Dependencies

```bash
# Install Playwright and its dependencies
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
cd e2e
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

## Test Development Workflow

### Understanding Test IDs

Reitti uses a test ID system to organize and track tests. Before creating a new test, you should:

1. **Check existing test IDs** in `docs/testing/` (e.g., `docs/testing/authenticaion.md`)
2. **Add a new test ID** if needed in the appropriate documentation file
3. **Reference the test ID** in your Playwright test file

Example from `docs/testing/authenticaion.md`:
```
| Test ID     | Requirement                               | Category | Playwright Test File     |
|-------------|-------------------------------------------|----------|--------------------------|
| **AUTH-01** | Standard Username/Password Login          | Auth     | `e2e/tests/auth.spec.js` |
```

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
4. A browser window will open – navigate to `http://localhost:8080`
5. Perform the actions you want to test (click, type, navigate)
6. Playwright will automatically record your actions as test code
7. Click "Save" to save the test

#### 3. Edit and Enhance Recorded Tests

The recorded code will look something like this:

```javascript
test('login test', async ({ page }) => {
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

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [Reitti Testing Documentation](docs/testing/)