# Casos de Uso - Idle Clicker Game

> **Estado**: ✅ Implementados en arquitectura hexagonal con TDD
> **Tests**: 92 tests pasando
> **Fecha**: 2026-03-16

---

## UC-001: Iniciar Sesión del Jugador ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-001 |
| **Nombre** | Iniciar Sesión del Jugador |
| **Actor** | Jugador |
| **Precondiciones** | El jugador tiene un playerId válido |
| **Flujo Principal** | 1. El jugador abre la app/web<br>2. El sistema obtiene o crea el jugador en MongoDB<br>3. El sistema retorna el estado del juego |
| **Postcondiciones** | El jugador tiene su estado sincronizado |
| **Datos de Salida** | `GameState: { coins, coinsPerClick, coinsPerSecond, upgrades[], shopUpgrades[] }` |

---

## UC-002: Hacer Click para Obtener Coins ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-002 |
| **Nombre** | Generar Coins por Click |
| **Actor** | Jugador |
| **Precondiciones** | El jugador está logueado (UC-001) |
| **Flujo Principal** | 1. El jugador hace click en el botón principal<br>2. El sistema calcula los coins ganados (`coinsPerClick`)<br>3. El sistema actualiza los coins del jugador<br>4. El sistema retorna los nuevos valores |
| **Postcondiciones** | Los coins del jugador aumentan en `coinsPerClick` |
| **Datos de Salida** | `{ player, earned }` |
| **Regla de Negocio** | La operación debe ser atómica para evitar race conditions |

---

## UC-003: Comprar Upgrade (Inventario) ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-003 |
| **Nombre** | Comprar Upgrade desde el Inventario |
| **Actor** | Jugador |
| **Precondiciones** | El jugador está logueado y tiene coins suficientes |
| **Flujo Principal** | 1. El jugador selecciona un upgrade de su inventario<br>2. El sistema valida: tiene coins suficientes? no alcanzó el nivel máximo?<br>3. El sistema deduce el costo<br>4. El sistema aumenta el nivel del upgrade<br>5. El sistema aplica el efecto (click o passive)<br>6. El sistema recalcula costos para el siguiente nivel |
| **Postcondiciones** | - Upgrade aumenta de nivel<br>- Coins del jugador disminuyen<br>- `coinsPerClick` o `coinsPerSecond` aumenta |
| **Datos de Salida** | `{ success: true, player, upgrade }` |
| **Errores** | `Insufficient coins`, `Max level reached`, `Upgrade not found` |

---

## UC-004: Generar Ingresos Pasivos (Idle) ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-004 |
| **Nombre** | Generar Ingresos Pasivos |
| **Actor** | Sistema (tarea programada) |
| **Precondiciones** | El jugador tiene `coinsPerSecond > 0` |
| **Flujo Principal** | 1. El sistema calcula el tiempo desde el último update<br>2. El sistema limita a máximo 8 horas offline<br>3. El sistema calcula: `earned = coinsPerSecond * segundos`<br>4. El sistema actualiza los coins atómicamente |
| **Postcondiciones** | Los coins del jugador aumentan por ingresos pasivos |
| **Datos de Salida** | `{ earned, newCoins }` |
| **Regla de Negocio** | Máximo 8 horas de ingresos offline |

---

## UC-005: Obtener Shop Upgrades ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-005 |
| **Nombre** | Obtener Upgrades del Shop |
| **Actor** | Jugador |
| **Precondiciones** | El jugador está logueado |
| **Flujo Principal** | 1. El sistema obtiene los upgrades disponibles (máx 4)<br>2. Para nuevos jugadores: garantiza al menos 1 Tier 1<br>3. El sistema retorna la lista de upgrades del shop |
| **Postcondiciones** | El jugador ve los upgrades disponibles para comprar |
| **Datos de Salida** | `UpgradeConfig[]` (máx 4 items) |

---

## UC-006: Comprar Upgrade del Shop ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-006 |
| **Nombre** | Comprar Upgrade desde el Shop |
| **Actor** | Jugador |
| **Precondiciones** | El jugador tiene coins suficientes y el upgrade está en el shop |
| **Flujo Principal** | 1. El jugador selecciona un upgrade del shop<br>2. El sistema valida: existe en shop? tiene coins?<br>3. Si ya tiene el upgrade: aumenta nivel existente<br>4. Si es nuevo: lo agrega al inventario<br>5. El sistema deduce el costo y aplica el efecto<br>6. El sistema remueve el upgrade del shop<br>7. El sistema genera un nuevo upgrade para reemplazar |
| **Postcondiciones** | - Upgrade movido del shop al inventario (o nivel aumentado)<br>- Coins deducidos<br>- Stats actualizados |
| **Datos de Salida** | `{ success: true }` |

---

## UC-007: Refrescar Shop ⚠️ PENDIENTE (No implementado aún)

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-007 |
| **Nombre** | Refrescar los Upgrades del Shop |
| **Actor** | Jugador |
| **Precondiciones** | El jugador tiene el costo de refresh (opcional) |
| **Flujo Principal** | 1. El jugador solicita refresh del shop<br>2. El sistema deduce el costo si aplica<br>3. El sistema genera nuevos upgrades aleatorios<br>4. El sistema reemplaza los actuales |
| **Postcondiciones** | El shop tiene nuevos upgrades |
| **Datos de Salida** | `{ success: true, upgrades[] }` |

---

## UC-008: Intercambiar Upgrade del Shop ⚠️ PENDIENTE (No implementado aún)

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-008 |
| **Nombre** | Intercambiar un Upgrade del Shop |
| **Actor** | Jugador |
| **Precondiciones** | El upgrade existe en el shop |
| **Flujo Principal** | 1. El jugador selecciona un upgrade para intercambiar<br>2. El sistema genera un nuevo upgrade aleatorio<br>3. El sistema reemplaza el seleccionado |
| **Postcondiciones** | Un upgrade diferente aparece en el shop |
| **Datos de Salida** | `{ success: true, newUpgrade }` |

---

## UC-009: Sincronizar Estado (Save Game) ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-009 |
| **Nombre** | Guardar/Sincronizar Estado del Juego |
| **Actor** | Jugador (cliente) |
| **Precondiciones** | El jugador está logueado |
| **Flujo Principal** | 1. El cliente envía el estado actual<br>2. El sistema acepta SOLO los coins del cliente<br>3. El sistema recalcula `coinsPerClick` y `coinsPerSecond` desde los upgrades<br>4. El sistema recalcula costos desde la fórmula original<br>5. El sistema guarda en MongoDB |
| **Postcondiciones** | Estado del jugador persistido |
| **Regla de Negocia** | - NO se aceptan `coinsPerClick` ni `coinsPerSecond` del cliente<br>- Se recalculan desde los upgrades comprados |

---

## UC-010: Obtener Datos de Sincronización ✅ IMPLEMENTADO

| Campo | Descripción |
|-------|-------------|
| **ID** | UC-010 |
| **Nombre** | Obtener Datos para Sincronización |
| **Actor** | Jugador |
| **Precondiciones** | El jugador está logueado |
| **Flujo Principal** | 1. El sistema obtiene el estado actual del jugador<br>2. El sistema retorna los datos de sync |
| **Postcondiciones** | El cliente tiene los datos para sincronizar |
| **Datos de Salida** | `{ coins, coinsPerClick, coinsPerSecond, lastSync }` |

---

## Matriz de Trazabilidad

| Caso de Uso | Servicio | Endpoint/API | Validaciones |
|-------------|----------|--------------|--------------|
| UC-001 | IdleGameService | getGameState() | playerId válido |
| UC-002 | IdleGameService | processClick() | Race condition protection |
| UC-003 | IdleGameService | buyUpgrade() | coins >= costo, nivel < max |
| UC-004 | IdleGameService | calculateOfflineProgress() | Máximo 8 horas |
| UC-005 | IdleGameService | getShopUpgrades() | - |
| UC-006 | IdleGameService | buyShopUpgrade() | coins >= costo, existe en shop |
| UC-007 | IdleGameService | refreshShopUpgrades() | Costo opcional |
| UC-008 | IdleGameService | swapShopUpgrade() | Existe en shop |
| UC-009 | IdleGameService | saveGame() | Recálculo de stats |
| UC-010 | IdleGameService | getSyncData() | - |

---

## Reglas de Negocio Identificadas

1. **Operaciones Atómicas**: Todas las actualizaciones de coins deben usar `$inc` atómico para evitar race conditions
2. **Offline Máximo**: Los ingresos pasivos offline están limitados a 8 horas
3. **Fórmula de Costo**: `costo = costoBase * (multiplicador ^ nivel)`
4. **Stats Inmutables desde Cliente**: El servidor recalcula `coinsPerClick` y `coinsPerSecond` desde los upgrades
5. **Shop Fijo**: Máximo 4 upgrades en el shop
6. **Tier 1 Garantizado**: Nuevos jugadores tienen al menos 1 upgrade básico

---

## Resumen de Implementación

### Estado de Casos de Uso

| UC | Nombre | Estado | Tests |
|----|--------|--------|-------|
| UC-001 | Iniciar Sesión del Jugador | ✅ Implementado | 8 |
| UC-002 | Hacer Click | ✅ Implementado | 4 |
| UC-003 | Comprar Upgrade (Inventario) | ✅ Implementado | 8 |
| UC-004 | Ingresos Pasivos (Idle) | ✅ Implementado | 5 |
| UC-005 | Obtener Shop Upgrades | ✅ Implementado | 2 |
| UC-006 | Comprar Upgrade del Shop | ✅ Implementado | 2 |
| UC-007 | Refrescar Shop | ⚠️ Pendiente | 0 |
| UC-008 | Intercambiar Upgrade del Shop | ⚠️ Pendiente | 0 |
| UC-009 | Guardar Estado | ✅ Implementado | 1 |
| UC-010 | Obtener Datos de Sync | ✅ Implementado | 2 |

**Total: 8/10 implementados (80%)**

---

## Arquitectura Hexagonal

```
src/
├── domain/
│   ├── entities/       # Tipos y entidades del dominio
│   └── services/       # Lógica de negocio pura (GameCalculator)
├── ports/              # Interfaces de repositorio
├── adapters/
│   └── in-memory/     # Implementación en memoria (para tests)
└── usecases/          # Casos de uso implementados
```

### Puertos (Interfaces)

- `PlayerRepository`: Acceso a datos de jugadores
- `UpgradeConfigRepository`: Acceso a configuraciones de upgrades

### Adaptadores

- `InMemoryPlayerRepository`: Implementación en memoria
- `InMemoryUpgradeConfigRepository`: Implementación en memoria

---

## Próximos Pasos

1. **Implementar UC-007**: Refrescar Shop
2. **Implementar UC-008**: Intercambiar Upgrade del Shop
3. **Crear adaptadores MongoDB**: Para producción
4. **Integrar con API existente**: Conectar los casos de uso con los controladores
