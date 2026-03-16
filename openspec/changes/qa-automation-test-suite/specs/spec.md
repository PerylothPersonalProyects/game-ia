# Delta for QA Automation

## Purpose

Establecer especificaciones para la suite de pruebas automatizadas del Idle Clicker Game, divididas en pruebas de Frontend (Playwright) y Backend (Karate).

---

## ADDED Requirements

### Requirement: Frontend Test Suite - Gameplay

La suite de pruebas de frontend DEBE verificar el comportamiento del juego en el navegador.

#### Scenario: Carga del juego

- GIVEN El usuario accede a la página del juego
- WHEN La página termina de cargar
- THEN El área de juego DEBE ser visible
- AND El contador de monedas DEBE mostrar un número válido

#### Scenario: Generación de monedas por click

- GIVEN El juego ha cargado con contador de monedas en 0
- WHEN El usuario hace click en el área de juego
- THEN El contador de monedas DEBE incrementarse en coinsPerClick
- AND El valor mostrado DEBE ser mayor al inicial

#### Scenario: Generación pasiva de monedas

- GIVEN El juego tiene coinsPerSecond > 0
- WHEN Pasan 2 segundos sin interacción del usuario
- THEN El contador de monedas DEBE incrementarse automáticamente

#### Scenario: Compra de upgrade

- GIVEN El usuario tiene suficientes monedas para comprar un upgrade
- WHEN El usuario hace click en el botón de comprar un upgrade
- THEN Las monedas DEBEN disminuir en el costo del upgrade
- AND El nivel del upgrade DEBE incrementarse
- AND Los stats (coinsPerClick o coinsPerSecond) DEBEN reflejar el upgrade

#### Scenario: Upgrade no disponible por falta de monedas

- GIVEN El usuario tiene menos monedas que el costo del upgrade
- WHEN El usuario intenta comprar el upgrade
- THEN El botón DEBE estar deshabilitado
- OR El sistema DEBE mostrar error "INSUFFICIENT_COINS"

---

### Requirement: Frontend Test Suite - Configuración

La configuración de Playwright DEBE permitir ejecución en múltiples navegadores y entornos.

#### Scenario: Ejecución en Chromium

- GIVEN La configuración especifica Chromium como navegador
- WHEN Se ejecutan los tests
- THEN Los tests DEBEN ejecutarse en Chrome/Chromium

#### Scenario: Ejecución en Firefox

- GIVEN La configuración especifica Firefox como navegador
- WHEN Se ejecutan los tests
- THEN Los tests DEBEN ejecutarse en Firefox

#### Scenario: Ejecución en WebKit

- GIVEN La configuración especifica WebKit como navegador
- WHEN Se ejecutan los tests
- THEN Los tests DEBEN ejecutarse en Safari/WebKit

#### Scenario: Captura de evidencia en fallo

- GIVEN Un test falla durante la ejecución
- WHEN El test termina
- THEN Se DEBE generar un screenshot del estado actual
- AND Se DEBE generar un video de la sesión (si está configurado)

---

### Requirement: Backend Test Suite - API REST

La suite de pruebas de backend DEBE verificar todos los endpoints de la API REST.

#### Scenario: GET /api/game/:userId - Estado inicial

- GIVEN Un usuario nuevo con ID "test-user-1"
- WHEN Se hace GET a /api/game/test-user-1
- THEN La respuesta DEBE tener status 200
- AND El body DEBE contener coins: 0
- AND El body DEBE contener coinsPerClick: 1
- AND El body DEBE contener coinsPerSecond: 0
- AND El body DEBE contener un array de upgrades

#### Scenario: POST /api/game/:userId/click

- GIVEN Un usuario con 10 monedas y coinsPerClick: 1
- WHEN Se hace POST a /api/game/test-user-1/click con {currentCoins: 10, coinsPerClick: 1}
- THEN La respuesta DEBE tener success: true
- AND La respuesta DEBE contener newCoins: 11

#### Scenario: POST /api/game/:userId/upgrade/:upgradeId - Éxito

- GIVEN Un usuario con 100 monedas
- WHEN Se hace POST a /api/game/test-user-1/upgrade/cursor con {currentCoins: 100, upgradeId: "cursor"}
- THEN La respuesta DEBE tener success: true
- AND newCoins DEBE ser menor a currentCoins
- AND upgradePurchased DEBE indicar purchased incrementado

#### Scenario: POST /api/game/:userId/upgrade/:upgradeId - Fondo insuficiente

- GIVEN Un usuario con 5 monedas
- WHEN Se hace POST a /api/game/test-user-1/upgrade/grandma con {currentCoins: 5, upgradeId: "grandma"}
- THEN La respuesta DEBE tener success: false
- AND La respuesta DEBE contener error: "INSUFFICIENT_COINS"

#### Scenario: POST /api/game/:userId - Guardar estado

- GIVEN Un estado de juego modificado
- WHEN Se hace POST a /api/game/test-user-1 con el estado
- THEN La respuesta DEBE confirmar el guardado
- AND El estado DEBE persistirse para recuperación posterior

---

### Requirement: Backend Test Suite - WebSocket

La suite de pruebas DEBE verificar la funcionalidad de WebSocket.

#### Scenario: Conexión WebSocket exitosa

- GIVEN El servidor está corriendo
- WHEN El cliente se conecta al WebSocket
- THEN La conexión DEBE establecerse exitosamente

#### Scenario: Evento join

- GIVEN Una conexión WebSocket establecida
- WHEN El cliente envía evento "join" con userId
- THEN El servidor DEBE confirmar la unión al juego

#### Scenario: Evento click en WebSocket

- GIED Una conexión WebSocket establecida
- WHEN El cliente envía evento "click" con coinsPerClick
- THEN El servidor DEBE procesar el click
- AND Enviar actualización de estado al cliente

#### Scenario: Evento buy en WebSocket

- GIVEN Una conexión WebSocket establecida
- WHEN El cliente envía evento "buy" con upgradeId
- THEN El servidor DEBE procesar la compra
- AND Actualizar el estado del upgrade

---

### Requirement: Backend Test Suite - Karate Configuration

La configuración de Karate DEBE permitir ejecución modular y data-driven.

#### Scenario: Ejecución de feature individual

- GIVEN Un archivo .feature de Karate existe
- WHEN Se ejecuta karate desde línea de comandos
- THEN El test DEBE ejecutarse y reportar resultados

#### Scenario: Tests data-driven desde JSON

- GIVEN Un archivo JSON con casos de prueba
- WHEN Karate ejecuta el feature
- THEN Cada línea del JSON DEBE ejecutarse como caso de prueba independiente

---

## MODIFIED Requirements

### Requirement: qa/playwright.config.ts - Configuración existente

La configuración existente DEBE expandirse para incluir más funcionalidades.

(Previously: Configuración básica con testDir y un proyecto chromium)

#### Scenario: Configuración expandida

- GIVEN La nueva configuración
- WHEN Se inicia la suite de tests
- THEN DEBE incluir múltiples proyectos (chromium, firefox, webkit)
- AND DEBE incluir reporter HTML y list
- AND DEBE incluir configuración de screenshot y video
- AND DEBE incluir timeouts apropiados para juegos

---

## REMOVED Requirements

(Ninguno - es un proyecto nuevo)

---

## Coverage

### Happy Paths
- [x] Carga del juego
- [x] Click genera monedas
- [x] Generación pasiva
- [x] Compra de upgrade exitosa
- [x] GET estado del juego
- [x] POST click
- [x] POST upgrade exitoso
- [x] WebSocket conexión
- [x] WebSocket eventos

### Edge Cases
- [x] Upgrade sin suficientes monedas
- [x] GET usuario nuevo (estado por defecto)
- [x] Upgrade al máximo nivel

### Error States
- [x] Error INSUFFICIENT_COINS
- [x] Connection failures (implicitamente manejado por Karate)
