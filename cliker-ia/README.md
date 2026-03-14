# Idle Clicker - Juego Incremental

Juego idle clicker construido con React + Phaser + TypeScript.

## Resumen del Proyecto

Juego incremental donde el jugador hace click para generar monedas y compra mejoras para obtener ingresos pasivos. Combina UI React con gráficos Phaser para una experiencia interactiva. Soporta modo multiplayer con tiendas para intercambiar items.

## Tecnologías

- **Frontend**: React 19 + TypeScript
- **Game Engine**: Phaser 3
- **Build Tool**: Vite 8
- **Testing**: Vitest + Testing Library
- **Styling**: CSS Modules
- **WebSocket**: Socket.io Client
- **Backend**: [server-cliker-ia](../server-cliker-ia/)

## Integración con Backend

### API Backend

El backend expone una API WebSocket para funcionalidades multiplayer:

- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/openapi.json`

### Eventos Socket.io

| Evento | Descripción |
|--------|-------------|
| `create_room` | Crear sala multiplayer |
| `join_room` | Unirse a una sala |
| `leave_room` | Salir de la sala |
| `get_rooms` | Listar salas disponibles |
| `create_shop` | Crear tienda en la sala |
| `get_shops` | Listar tiendas |
| `get_shop_status` | Ver items de tienda |
| `buy_item` | Comprar item |
| `sell_item` | Vender item |
| `get_inventory` | Ver inventario del jugador |

## Estructura del Proyecto

```
cliker-ia/
├── src/
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts        # GameState, Upgrade interfaces
│   ├── store/              # Lógica de negocio (backend)
│   │   ├── gameStore.ts    # Estado inicial, funciones pure
│   │   └── useGameState.ts # Hook React
│   ├── game/               # Phaser
│   │   └── ClickerGame.tsx # Escena del juego
│   ├── api/                # Integración con backend
│   │   └── socketClient.ts # Cliente Socket.io
│   ├── components/        # UI React
│   │   ├── GameUI.tsx      # Componente principal
│   │   └── GameUI.css     # Estilos
│   └── __tests__/         # Tests automáticos
│       └── gameStore.test.ts
├── vitest.config.ts        # Configuración de tests
├── package.json
└── tsconfig.app.json
```

## Reglas del Juego

- **Click**: Cada click produce monedas (base: 1)
- **Pasivo**: Monedas generadas por segundo
- **Upgrades**: 
  - Cursor: +1 moneda/click
  - Abuela: +1 moneda/segundo
  - Granja: +5 monedas/segundo
  - Mina: +15 monedas/segundo
  - Fábrica: +50 monedas/segundo

## Comandos

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Build de producción
npm run test       # Ejecutar tests
npm run lint       # Linting
```

## Estado del Juego (GameState)

```typescript
interface GameState {
  coins: number;           // Monedas actuales
  coinsPerClick: number;    // Monedas por click
  coinsPerSecond: number;   // Monedas por segundo
  upgrades: Upgrade[];      // Lista de mejoras
}
```

## Decisiones de Diseño

1. **Separación UI/Game**: Phaser maneja el área de click visual, React maneja el estado y UI
2. **Estado inmutable**: Funciones pure en gameStore.ts para facilitar testing
3. **Costos exponenciales**: Multiplicador aplicado a cada upgrade comprado

## Issues Conocidos

- Chunk de bundle grande (~1.4MB) por Phaser - considerar code splitting
- El juego Phaser requiere inicialización asíncrona de la escena

## Tests

16 tests cubriendo:
- clickCoins(): Generación de monedas por click
- passiveIncome(): Generación pasiva
- calculateCost(): Cálculo de costos con multiplicador
- purchaseUpgrade(): Compra de upgrades
- canAfford(): Verificación de compra posible
