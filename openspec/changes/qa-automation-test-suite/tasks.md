# Tasks: QA Automation Test Suite

## Phase 1: Infrastructure - Frontend (qa/)

- [x] 1.1 Expandir `qa/playwright.config.ts` con más configuraciones (fixtures, timeouts, proyectos)
- [x] 1.2 Crear `qa/tests/fixtures/game-fixtures.ts` con fixtures personalizadas
- [x] 1.3 Crear `qa/tests/page-objects/GamePage.ts` con Page Object Model

## Phase 2: Frontend Tests - Gameplay

- [x] 2.1 Actualizar `qa/tests/game.spec.ts` para incluir más scenarios
- [x] 2.2 Crear `qa/tests/gameplay.spec.ts` con tests de:
  - [x] 2.2.1 Click genera monedas
  - [x] 2.2.2 Generación pasiva (coinsPerSecond)
  - [x] 2.2.3 Compra de upgrade exitosa
  - [x] 2.2.4 Upgrade sin suficientes monedas
- [x] 2.3 Agregar test de verificación de estado de juego

## Phase 3: Frontend Tests - Visual

- [x] 3.1 Crear `qa/tests/visual.spec.ts` para regresión visual
- [x] 3.2 Configurar directorio de snapshots
- [x] 3.3 Agregar test de screenshot del UI principal

## Phase 4: Infrastructure - Backend (karate/)

- [x] 4.1 Crear `karate/pom.xml` con dependencias de Karate
- [x] 4.2 Crear `karate/karate.config.js` con configuración base
- [x] 4.3 Crear `karate/src/test/resources/game-data.json` con datos de prueba

## Phase 5: Backend Tests - API REST

- [x] 5.1 Crear `karate/src/test/java/game.feature` con tests de:
  - [x] 5.1.1 GET /api/game/:userId - Estado inicial
  - [x] 5.1.2 POST /api/game/:userId/click
  - [x] 5.1.3 POST /api/game/:userId/upgrade/:upgradeId - Éxito
  - [x] 5.1.4 POST /api/game/:userId/upgrade/:upgradeId - Fondo insuficiente
  - [x] 5.1.5 POST /api/game/:userId - Guardar estado

## Phase 6: Backend Tests - WebSocket

- [x] 6.1 Crear `karate/src/test/java/websocket.feature` con tests de:
  - [x] 6.1.1 Conexión WebSocket exitosa
  - [x] 6.1.2 Evento join
  - [x] 6.1.3 Evento click
  - [x] 6.1.4 Evento buy

## Phase 7: Integration & Verification

- [ ] 7.1 Ejecutar tests de frontend y verificar que pasan
- [ ] 7.2 Ejecutar tests de backend y verificar que pasan
- [ ] 7.3 Generar reportes HTML
- [ ] 7.4 Documentar ejecución en README de cada proyecto
