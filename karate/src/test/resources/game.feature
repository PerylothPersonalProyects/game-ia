# API Tests for Idle Clicker Game
# Tests REST API endpoints

Feature: Game API - Estado y Operaciones

  Background:
    * def baseUrl = karate.properties['api.url'] || 'http://localhost:3000/api'
    * def userId = 'test-user-' + karate.uuid()
    * def gameData = read('classpath:game-data.json')

  # ============================================
  # GET /api/game/:userId - Estado inicial
  # ============================================
  Scenario: 5.1.1 GET /api/game/:userId - Estado inicial

    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    And match response == 
      """
      {
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
        upgrades: '##array'
      }
      """
    And match response.coins == 0
    And match response.coinsPerClick == 1
    And match response.coinsPerSecond == 0

  # ============================================
  # POST /api/game/:userId/click
  # ============================================
  Scenario: 5.1.2 POST /api/game/:userId/click - Generar monedas

    # First get initial state
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    * def initialCoins = response.coins

    # Make a click
    Given url baseUrl + '/game/' + userId + '/click'
    And request { currentCoins: #(initialCoins), coinsPerClick: 1 }
    When method POST
    Then status 200
    And match response.success == true
    And match response.newCoins == initialCoins + 1

  Scenario: POST /api/game/:userId/click con coinsPerClick mayor

    Given url baseUrl + '/game/' + userId + '/click'
    And request { currentCoins: 10, coinsPerClick: 5 }
    When method POST
    Then status 200
    And match response.success == true
    And match response.newCoins == 15

  # ============================================
  # POST /api/game/:userId/upgrade/:upgradeId - Éxito
  # ============================================
  Scenario: 5.1.3 POST /api/game/:userId/upgrade/:upgradeId - Compra exitosa

    # Set up user with enough coins
    Given url baseUrl + '/game/' + userId
    And request { coins: 100, coinsPerClick: 1, coinsPerSecond: 0, upgrades: [] }
    When method POST
    Then status 200

    # Try to buy cursor upgrade (cost: 15)
    Given url baseUrl + '/game/' + userId + '/upgrade/cursor'
    And request { currentCoins: 100, upgradeId: 'cursor' }
    When method POST
    Then status 200
    And match response.success == true
    And match response.newCoins == 85
    And match response.upgradePurchased.id == 'cursor'
    And match response.upgradePurchased.purchased == 1
    And match response.newCoinsPerClick == 2

  # ============================================
  # POST /api/game/:userId/upgrade/:upgradeId - Fondo insuficiente
  # ============================================
  Scenario: 5.1.4 POST /api/game/:userId/upgrade/:upgradeId - Fondo insuficiente

    # Set up user with few coins
    Given url baseUrl + '/game/' + userId
    And request { coins: 5, coinsPerClick: 1, coinsPerSecond: 0, upgrades: [] }
    When method POST
    Then status 200

    # Try to buy grandma upgrade (cost: 100)
    Given url baseUrl + '/game/' + userId + '/upgrade/grandma'
    And request { currentCoins: 5, upgradeId: 'grandma' }
    When method POST
    Then status 200
    And match response.success == false
    And match response.error == 'INSUFFICIENT_COINS'
    And match response.required == 100
    And match response.available == 5

  # ============================================
  # POST /api/game/:userId - Guardar estado
  # ============================================
  Scenario: 5.1.5 POST /api/game/:userId - Guardar estado

    # Save game state
    Given url baseUrl + '/game/' + userId
    And request 
      """
      {
        coins: 500,
        coinsPerClick: 3,
        coinsPerSecond: 10,
        upgrades: [
          { id: 'cursor', purchased: 5 },
          { id: 'grandma', purchased: 2 }
        ]
      }
      """
    When method POST
    Then status 200

    # Verify state was saved by retrieving it
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    And match response.coins == 500
    And match response.coinsPerClick == 3
    And match response.coinsPerSecond == 10
    And match response.upgrades == '#[2]'

  # ============================================
  # Tests adicionales - Edge Cases
  # ============================================
  Scenario: Upgrade increases coinsPerClick

    # Set up user
    Given url baseUrl + '/game/' + userId
    And request { coins: 1000, coinsPerClick: 1, coinsPerSecond: 0, upgrades: [] }
    When method POST
    Then status 200

    # Buy cursor upgrade
    Given url baseUrl + '/game/' + userId + '/upgrade/cursor'
    And request { currentCoins: 1000, upgradeId: 'cursor' }
    When method POST
    Then status 200
    And match response.newCoinsPerClick == 2

    # Buy another cursor
    Given url baseUrl + '/game/' + userId + '/upgrade/cursor'
    And request { currentCoins: 985, upgradeId: 'cursor' }
    When method POST
    Then status 200
    And match response.newCoinsPerClick == 3

  Scenario: Upgrade increases coinsPerSecond

    # Set up user
    Given url baseUrl + '/game/' + userId
    And request { coins: 5000, coinsPerClick: 1, coinsPerSecond: 0, upgrades: [] }
    When method POST
    Then status 200

    # Buy grandma upgrade
    Given url baseUrl + '/game/' + userId + '/upgrade/grandma'
    And request { currentCoins: 5000, upgradeId: 'grandma' }
    When method POST
    Then status 200
    And match response.newCoinsPerSecond == 1
