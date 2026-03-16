# WebSocket Tests for Idle Clicker Game
# Tests WebSocket connection and events

Feature: Game WebSocket - Conexión y Eventos

  # ============================================
  # Conexión WebSocket
  # ============================================
  Scenario: 6.1.1 Conexión WebSocket exitosa

    * def wsUrl = karate.properties['ws.url'] || 'ws://localhost:3000'
    * def userId = 'test-user-' + karate.uuid()
    
    # Connect to WebSocket
    Given url wsUrl
    When method WSConnect
    Then status 200
    * def wsResponse = response
    And match wsResponse != null

  # ============================================
  # Evento join
  # ============================================
  Scenario: 6.1.2 Evento join - Unirse al juego

    * def wsUrl = karate.properties['ws.url'] || 'ws://localhost:3000'
    * def userId = 'test-user-' + karate.uuid()
    
    # Connect
    Given url wsUrl
    When method WSConnect
    Then status 200
    
    # Send join event
    Given url wsUrl
    And text { type: 'join', userId: '#(userId)' }
    When method WSSend
    Then status 200
    
    # Wait for response
    * def wsResponse = response
    And match wsResponse.type == 'joined' || wsResponse.type == 'gameState'
    And match wsResponse.userId == userId

  # ============================================
  # Evento click
  # ============================================
  Scenario: 6.1.3 Evento click - Generar monedas via WebSocket

    * def wsUrl = karate.properties['ws.url'] || 'ws://localhost:3000'
    * def userId = 'test-user-' + karate.uuid()
    
    # Connect
    Given url wsUrl
    When method WSConnect
    Then status 200
    
    # Join game
    Given url wsUrl
    And text { type: 'join', userId: '#(userId)' }
    When method WSSend
    * karate.wait(500)
    
    # Send click event
    Given url wsUrl
    And text { type: 'click', userId: '#(userId)', coinsPerClick: 1 }
    When method WSSend
    Then status 200
    
    # Wait for response
    * karate.wait(500)
    * def wsResponse = response
    And match wsResponse.type == 'update' || wsResponse.type == 'click'
    And match wsResponse.userId == userId

  # ============================================
  # Evento buy
  # ============================================
  Scenario: 6.1.4 Evento buy - Comprar upgrade via WebSocket

    * def wsUrl = karate.properties['ws.url'] || 'ws://localhost:3000'
    * def userId = 'test-user-' + karate.uuid()
    
    # Connect
    Given url wsUrl
    When method WSConnect
    Then status 200
    
    # Join game
    Given url wsUrl
    And text { type: 'join', userId: '#(userId)' }
    When method WSSend
    * karate.wait(500)
    
    # Give user some coins first (via API)
    * def apiUrl = karate.properties['api.url'] || 'http://localhost:3000/api'
    Given url apiUrl + '/game/' + userId
    And request { coins: 1000, coinsPerClick: 1, coinsPerSecond: 0, upgrades: [] }
    When method POST
    Then status 200
    
    # Send buy event
    Given url wsUrl
    And text { type: 'buy', userId: '#(userId)', upgradeId: 'cursor' }
    When method WSSend
    Then status 200
    
    # Wait for response
    * karate.wait(500)
    * def wsResponse = response
    And match wsResponse.type == 'update' || wsResponse.type == 'upgrade' || wsResponse.type == 'buy'
    And match wsResponse.userId == userId

  # ============================================
  # WebSocket disconnection
  # ============================================
  Scenario: WebSocket disconnection

    * def wsUrl = karate.properties['ws.url'] || 'ws://localhost:3000'
    * def userId = 'test-user-' + karate.uuid()
    
    # Connect
    Given url wsUrl
    When method WSConnect
    Then status 200
    
    # Join
    Given url wsUrl
    And text { type: 'join', userId: '#(userId)' }
    When method WSSend
    * karate.wait(300)
    
    # Disconnect
    Given url wsUrl
    When method WSClose
    Then status 200
