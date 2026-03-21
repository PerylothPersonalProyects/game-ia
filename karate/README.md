# Backend Testing Suite - Karate

Automated API and WebSocket tests for the Idle Clicker Game using Karate DSL.

## Prerequisites

- Java JDK 11+
- Maven 3.6+
- Game backend running on `http://localhost:3000` (or configured API_URL)

## Installation

```bash
cd karate
mvn clean install
```

## Running Tests

### Run all tests
```bash
mvn test
```

### Run specific feature
```bash
mvn test -Dkarate.env=test
```

### Run with verbose output
```bash
mvn test -Dkarate.options="--tags @debug"
```

### Generate reports only
```bash
mvn surefire-report:report
```

## Test Structure

```
karate/
├── src/
│   ├── test/
│   │   ├── java/
│   │   │   └── karate-config.js    # Karate configuration
│   │   └── resources/
│   │       ├── game.feature        # REST API tests
│   │       ├── websocket.feature   # WebSocket tests
│   │       └── game-data.json      # Test data
│   └── test/
│       └── java/
│           └── GameTest.java       # JUnit runner
├── target/                         # Build output
├── karate.config.js                # Karate environment config
└── pom.xml                         # Maven configuration
```

## Test Scenarios

### REST API Tests (game.feature)

#### GET /api/game/:userId - Initial State (5.1.1)
- ✅ Returns status 200
- ✅ Contains coins: 0
- ✅ Contains coinsPerClick: 1
- ✅ Contains coinsPerSecond: 0
- ✅ Contains upgrades array

#### POST /api/game/:userId/click (5.1.2)
- ✅ Click generates coins correctly
- ✅ Returns success: true
- ✅ Returns new coin count

#### POST /api/game/:userId/upgrade/:upgradeId - Success (5.1.3)
- ✅ Successful upgrade purchase
- ✅ Coins deducted correctly
- ✅ Upgrade level incremented
- ✅ coinsPerClick/coinsPerSecond updated

#### POST /api/game/:userId/upgrade/:upgradeId - Insufficient Funds (5.1.4)
- ✅ Returns success: false
- ✅ Returns error: INSUFFICIENT_COINS
- ✅ Returns required and available amounts

#### POST /api/game/:userId - Save State (5.1.5)
- ✅ State saved successfully
- ✅ State persists for later retrieval

### WebSocket Tests (websocket.feature)

#### Connection (6.1.1)
- ✅ WebSocket connects successfully
- ✅ Connection is stable

#### Join Event (6.1.2)
- ✅ Join event processed
- ✅ User added to game

#### Click Event (6.1.3)
- ✅ Click event handled
- ✅ State update received

#### Buy Event (6.1.4)
- ✅ Buy event processed
- ✅ Upgrade applied

## Configuration

Edit `karate.config.js` to customize:

```javascript
var config = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  timeout: 10000
};
```

### Environment-Specific Configuration

Create `karate-config-<env>.js` for different environments:

```javascript
// karate-config-staging.js
function fn() {
  var config = {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://staging.example.com/api',
    wsUrl: 'wss://staging.example.com'
  };
  return config;
}
```

Run with:
```bash
mvn test -Dkarate.env=staging
```

## Test Data

Test data is defined in `src/test/resources/game-data.json`:

```json
{
  "testUsers": ["test-user-1", "test-user-2"],
  "upgradeCosts": {
    "cursor": 15,
    "grandma": 100
  }
}
```

## Data-Driven Testing

### JSON Data-Driven Example

```gherkin
Scenario Outline: Test upgrade costs
  Given url apiUrl + '/game/' + userId
  And request { coins: <coins>, upgradeId: '<id>' }
  When method POST
  Then status 200
  And match response.success == <expected>

  Examples:
    | userId       | coins | id      | expected |
    | test-user-1  | 100   | cursor  | true     |
    | test-user-1  | 5     | grandma | false    |
```

## Reports

### Maven Surefire Reports
- HTML: `target/surefire-reports/index.html`
- XML: `target/surefire-reports/*.xml`

### Karate HTML Report
```bash
mvn test karate:report
```

## Troubleshooting

### Connection refused
Ensure backend is running:
```bash
curl http://localhost:3000/api/game/test-user
```

### WebSocket tests failing
Check WebSocket endpoint is available:
```bash
ws://localhost:3000
```

### Timeout errors
Increase timeout in `karate.config.js`:
```javascript
karate.configure('readTimeout', 30000);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Karate Tests
  run: mvn test
  env:
    JAVA_HOME: ${{ matrix.java }}
```

### Docker Integration

```dockerfile
FROM maven:3.8-openjdk-11
WORKDIR /app
COPY . .
RUN mvn test
```

## API Contract Reference

See [docs/api-spec.md](../docs/api-spec.md) for complete API specification.

### Endpoints Tested

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/game/:userId | Get game state |
| POST | /api/game/:userId | Save game state |
| POST | /api/game/:userId/click | Process click |
| POST | /api/game/:userId/upgrade/:upgradeId | Purchase upgrade |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| join | Client → Server | Join game |
| click | Client → Server | Process click |
| buy | Client → Server | Purchase upgrade |
| update | Server → Client | State update |
| joined | Server → Client | Join confirmation |

---

**Note**: For frontend E2E tests, see the [qa/](../qa/README.md) project.
