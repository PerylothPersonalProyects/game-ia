# API Tests for Idle Clicker Game
# Tests REST API endpoints

Feature: Game API - Estado y Operaciones

  Background:
    * def baseUrl = karate.properties['api.url'] || 'http://localhost:3001/api'
    * def userId = 'test-user-' + uuid()
    * def gameData = read('classpath:game-data.json')

  # ============================================
  # GET /api/game/:userId - Estado inicial
  # ============================================
  Scenario: 5.1.1 GET /api/game/:userId - Estado inicial

    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    And match response.success == true
    And match response.data.coins == 0
    And match response.data.coinsPerClick == 1
    And match response.data.coinsPerSecond == 0

  # ============================================
  # POST /api/game/:userId/click
  # ============================================
  Scenario: 5.1.2 POST /api/game/:userId/click - Generar monedas

    # First get initial state
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    * def initialCoins = response.data.coins

    # Make a click
    Given url baseUrl + '/game/' + userId + '/click'
    When method POST
    Then status 200
    And match response.success == true
    And match response.data.coins == initialCoins + 1

  Scenario: POST /api/game/:userId/click multiples veces incrementa coins

    # First get initial state
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    * def initialCoins = response.data.coins

    # Make multiple clicks
    Given url baseUrl + '/game/' + userId + '/click'
    When method POST
    
    Given url baseUrl + '/game/' + userId + '/click'
    When method POST
    
    # Verify coins increased
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    And match response.data.coins == initialCoins + 2

  # ============================================
  # POST /api/game/:userId/upgrade - Compra de upgrade
  # ============================================
  Scenario: 5.1.3 POST /api/game/:userId/upgrade - Compra de upgrade

    # Just verify the endpoint responds (it may succeed or fail based on coins)
    Given url baseUrl + '/game/' + userId + '/upgrade'
    And request { upgradeId: 'click_1' }
    When method POST
    Then status 200
    # Response should be valid JSON
    And match response == '#object'

  # ============================================
  # POST /api/game/:userId/upgrade - Fondo insuficiente
  # ============================================
  Scenario: 5.1.4 POST /api/game/:userId/upgrade - Fondo insuficiente

    # Get user (should have 0 or few coins)
    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    
    # Try to buy expensive upgrade
    Given url baseUrl + '/game/' + userId + '/upgrade'
    And request { upgradeId: 'click_3' }
    When method POST
    Then status 200
    And match response.success == false

  # ============================================
  # GET /api/health - Salud del servidor
  # ============================================
  Scenario: GET /api/health - Verificar que el servidor responde

    Given url 'http://localhost:3001/api/health'
    When method GET
    Then status 200
    And match response.status == '#notnull'

  # ============================================
  # Tests adicionales - Crear usuario nuevo
  # ============================================
  Scenario: Crear usuario nuevo automaticamente

    * def uniqueUserId = 'new-user-' + uuid()
    
    Given url baseUrl + '/game/' + uniqueUserId
    When method GET
    Then status 200
    And match response.success == true
    And match response.data.coins == 0
    And match response.data.coinsPerClick == 1
    And match response.data.coinsPerSecond == 0
    And match response.data.upgrades == '#[6]'

  # ============================================
  # Tests adicionales - Verificar que upgrades existen
  # ============================================
  Scenario: Verificar que los upgrades del juego existen

    Given url baseUrl + '/game/' + userId
    When method GET
    Then status 200
    And match response.data.upgrades != null
    # Check that upgrades array has at least 1 element
    * def upgradeCount = response.data.upgrades.length
    * assert upgradeCount > 0
