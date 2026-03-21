# QA Testing Suite - Playwright

Automated end-to-end tests for the Idle Clicker Game using Playwright.

## Prerequisites

- Node.js 18+
- npm 8+
- Game frontend running on `http://localhost:5173` (or configured BASE_URL)
- (Optional) Game backend running on `http://localhost:3000` for API tests

## Installation

```bash
cd qa
npm install
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run with UI mode
```bash
npm run test:ui
```

### Run headed (visible browser)
```bash
npm run test:headed
```

### View test report
```bash
npm run test:report
```

## Test Structure

```
qa/
├── tests/
│   ├── fixtures/
│   │   └── game-fixtures.ts      # Custom fixtures for game state
│   ├── page-objects/
│   │   └── GamePage.ts           # Page Object Model for game
│   ├── game.spec.ts              # Basic game tests
│   ├── gameplay.spec.ts          # Gameplay mechanics tests
│   └── visual.spec.ts            # Visual regression tests
├── playwright.config.ts          # Playwright configuration
├── screenshots/                  # Screenshots directory
├── playwright-report/            # Test reports
└── videos/                       # Recorded videos on failures
```

## Test Scenarios

### 1. Game Load (2.1)
- ✅ Game loads successfully
- ✅ Game area is visible
- ✅ Coin counter displays valid value

### 2. Click Mechanics (2.2.1)
- ✅ Single click generates coins
- ✅ Multiple clicks generate more coins
- ✅ Coin counter increments correctly

### 3. Passive Generation (2.2.2)
- ✅ Coins accumulate over time when coinsPerSecond > 0

### 4. Upgrades (2.2.3, 2.2.4)
- ✅ Purchase upgrade with sufficient coins
- ✅ Upgrade unavailable with insufficient coins
- ✅ Disabled buttons when coins are low

### 5. Game State (2.3)
- ✅ Game state is accessible
- ✅ Coin counter shows valid values
- ✅ Game responds to user interactions

### 6. Visual Regression (3.x)
- ✅ Main UI screenshot comparison
- ✅ Screenshots saved on failure

## Configuration

Edit `playwright.config.ts` to customize:

```typescript
// Base URL
baseURL: process.env.BASE_URL || 'http://localhost:5173'

// Projects (browsers)
projects: ['chromium', 'firefox', 'webkit']

// Timeouts
timeout: 30000

// Screenshot/Video on failure
screenshot: 'only-on-failure'
video: 'retain-on-failure'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| BASE_URL | http://localhost:5173 | Game frontend URL |
| CI | false | Enable CI mode (1 worker, 2 retries) |

## Troubleshooting

### Tests fail due to timeout
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000
```

### Screenshots not matching
Update snapshots after visual changes:
```bash
npx playwright test --update-snapshots
```

### Browser not launching
Install browsers:
```bash
npx playwright install
```

## Reports

Test reports are generated in:
- HTML Report: `qa/playwright-report/index.html`
- JSON Report: `qa/playwright-report/results.json`

## CI/CD Integration

To run in CI:

```yaml
# Example GitHub Actions
- name: Run Playwright Tests
  run: |
    cd qa
    npm ci
    npx playwright install --with-deps
    npm test
```

---

**Note**: For API and WebSocket tests, see the [karate/](../karate/README.md) project.
