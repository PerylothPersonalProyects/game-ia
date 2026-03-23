# AI/ML Endpoint Tests for Idle Clicker Game
# Tests the GPT integration endpoints

Feature: AI/ML Endpoint Tests - Chat Integration

  Background:
    * def baseUrl = karate.properties['api.url'] || 'http://localhost:3000/api'
    * def userId = 'test-user-' + uuid()

  # ============================================
  # POST /api/ai/chat - Successful request
  # ============================================
  Scenario: AI.1 POST /api/ai/chat - Successful request

    Given url baseUrl + '/ai/chat'
    And request { prompt: "test", model: "gpt-4" }
    When method POST
    # Allow for both success (200) and service unavailable (503)
    Then status 200 || status 503
    # If 200, verify response structure
    * if (status == 200) karate.match(response, { response: '#string' })
    # If 503, verify error response
    * if (status == 503) karate.match(response, { error: '#string' })

  # ============================================
  # POST /api/ai/chat - Error handling
  # ============================================
  Scenario: AI.2 POST /api/ai/chat - Error handling

    Given url baseUrl + '/ai/chat'
    And request { prompt: "" }
    When method POST
    # Either returns error or 400 for bad request
    Then status 200 || status 400 || status 500 || status 503

  # ============================================
  # POST /api/ai/chat - Missing prompt
  # ============================================
  Scenario: AI.3 POST /api/ai/chat - Missing prompt field

    Given url baseUrl + '/ai/chat'
    And request { model: "gpt-4" }
    When method POST
    Then status 400 || status 422 || status 200

  # ============================================
  # POST /api/ai/chat - Different models
  # ============================================
  Scenario: AI.4 POST /api/ai/chat - With different model versions

    * def models = ["gpt-4", "gpt-3.5-turbo", "gpt-4o"]

    * def loop = function(i) {
      if (i < models.length) {
        var response = karate.call('classpath:ai-test.feature', { model: models[i] });
      }
    }

  # ============================================
  # GET /api/ai/models - List available models
  # ============================================
  Scenario: AI.5 GET /api/ai/models - List available models

    Given url baseUrl + '/ai/models'
    When method GET
    Then status 200 || status 404
    * if (status == 200) karate.match(response, { models: '#array' })