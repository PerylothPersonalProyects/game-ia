# Design: QA Automation Test Suite

## Technical Approach

Establecer dos proyectos de pruebas automatizadas independientes pero integrados:
1. **Frontend**: Ampliar qa/ con Playwright usando Page Object Model y fixtures personalizadas
2. **Backend**: Crear karate/ con Karate DSL para tests de API REST y WebSocket

## Architecture Decisions

### Decision: Estructura de proyecto Karate

**Choice**: Crear directorio karate/ en raíz del proyecto
**Alternatives considered**: Integrar en qa/ como carpeta adicional
**Rationale**: Karate funciona con archivos .feature y requiere configuración separada. Mantener separación clara facilita mantenimiento.

### Decision: Configuración de Playwright para juegos

**Choice**: Usar configuración existente y expandir con fixtures personalizadas
**Alternatives considered**: Crear nueva configuración desde cero
**Rationale**: Mantener compatibilidad con tests existentes y aprovechar configuración ya funcional.

### Decision: Modo de datos para Karate

**Choice**: Usar JSON externo para datos de prueba
**Alternatives considered**: Hardcode en features, usar CSV
**Rationale**: JSON es más legible y fácil de mantener para casos de prueba de API.

### Decision: URL base configurable

**Choice**: Usar variables de entorno para URLs
**Alternatives considered**: Hardcode localhost:3000
**Rationale**: Permite ejecución contra diferentes entornos (local, staging, CI).

## File Changes

### Proyecto Frontend (qa/)

| File | Action | Description |
|------|--------|-------------|
| qa/playwright.config.ts | Modify | Expandir con más proyectos, timeouts, fixtures |
| qa/tests/game.spec.ts | Modify | Agregar más scenarios de gameplay |
| qa/tests/gameplay.spec.ts | Create | Tests de jugabilidad (click, upgrades, pasivo) |
| qa/tests/visual.spec.ts | Create | Tests de regresión visual |
| qa/tests/fixtures/game-fixtures.ts | Create | Fixtures personalizadas para el juego |
| qa/tests/page-objects/GamePage.ts | Create | Page Object para el juego |

### Proyecto Backend (karate/)

| File | Action | Description |
|------|--------|-------------|
| karate/pom.xml | Create | Maven config para Karate |
| karate/karate.config.js | Create | Configuración de Karate |
| karate/src/test/java/game.feature | Create | Tests de API REST |
| karate/src/test/java/websocket.feature | Create | Tests de WebSocket |
| karate/src/test/java/karate-config.js | Create | Config de ambiente |
| karate/src/test/resources/game-data.json | Create | Datos de prueba |

## Data Flow

### Frontend Tests

```
Playwright Runner
    │
    ├── game.spec.ts (tests existentes)
    ├── gameplay.spec.ts (nuevos)
    │       │
    │       └── GamePage (Page Object)
    │               │
    │               └── Fixtures: gameState, authenticatedUser
    │
    └── visual.spec.ts
            │
            └── Screenshots comparison
```

### Backend Tests

```
Karate Runner
    │
    ├── game.feature (REST API)
    │       │
    │       └── game-data.json (data-driven)
    │
    └── websocket.feature (WebSocket)
            │
            └── karate-config.js (env config)
```

## Interfaces / Contracts

### Frontend - GamePage interface

```typescript
interface GamePage {
  goto(): Promise<void>;
  getCoins(): Promise<number>;
  clickGame(): Promise<void>;
  waitForCoins(amount: number): Promise<void>;
  buyUpgrade(upgradeId: string): Promise<boolean>;
  getUpgradeLevel(upgradeId: string): Promise<number>;
  waitForPassiveGeneration(seconds: number): Promise<void>;
}
```

### Backend - API Contract (from api-spec.md)

```typescript
// GET /api/game/:userId
interface GameStateResponse {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
}

// POST /api/game/:userId/click
interface ClickRequest {
  currentCoins: number;
  coinsPerClick: number;
}

interface ClickResponse {
  success: boolean;
  newCoins: number;
}

// POST /api/game/:userId/upgrade/:upgradeId
interface UpgradeRequest {
  currentCoins: number;
  upgradeId: string;
}

interface UpgradeSuccessResponse {
  success: true;
  newCoins: number;
  upgradePurchased: { id: string; purchased: number };
  newCoinsPerClick?: number;
  newCoinsPerSecond?: number;
}

interface UpgradeErrorResponse {
  success: false;
  error: 'INSUFFICIENT_COINS';
  required: number;
  available: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Frontend E2E | Jugabilidad completa del juego | Playwright con Page Objects |
| Frontend Visual | Regresión visual de UI | Playwright screenshot comparison |
| Backend API | Endpoints REST | Karate feature files |
| Backend WebSocket | Conexión y eventos | Karate WebSocket tests |

## Migration / Rollout

No se requiere migración de datos. La implementación es nueva.

**Fase 1**: Configurar proyecto Karate y crear features básicos
**Fase 2**: Expandir tests de frontend con más scenarios
**Fase 3**: Agregar tests de WebSocket

## Open Questions

- [ ] ¿Qué puerto usa el servidor backend? (api-spec.md no especifica, предполагаем 3000)
- [ ] ¿El juego frontend está en el mismo servidor que la API?
- [ ] ¿Necesitamos tests de autenticación (JWT)?
