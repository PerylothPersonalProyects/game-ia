# TODO - Idle Clicker Game

## 📋 Tareas por Rol

---

### 🎨 game_designer
- [ ] Diseñar UI/UX del juego (layout, colores, estilo visual)
- [ ] Definir animaciones y efectos visuales
- [ ] Crear guía de estilos visuales
- [ ] Definir experiencia de usuario (UX)

---

### 💰 economy_designer
- [ ] Balancear costos de upgrades
- [ ] Definir progresión económica del juego
- [ ] Ajustar multipliers y fórmulas de crecimiento
- [ ] Evitar inflación o progreso roto

---

### 🎮 gameplay_programmer
- [x] Implementar lógica de clicks
- [x] Implementar sistema de generación pasiva
- [x] Implementar sistema de upgrades
- [x] Conectar con el store de React

---

### 🔧 frontend (React)
- [x] Crear store/state centralizado
- [x] Implementar API de comunicación Phaser ↔ React
- [x] Crear sistema de guardado local (localStorage)
- [x] Preparar integración con API del servidor (capa de abstracción lista)

---

### 🖥️ backend (Node.js)
- [x] Crear endpoints RESTful
- [x] Implementar WebSocket para comunicación en tiempo real
- [x] Crear sistema de guardado/load de progreso
- [x] Definir estructura de base de datos (MongoDB)
- [x] Implementar sincronización de estado

---

### 🧪 QA - Testing

#### Test Unitarios Backend
- [ ] Tests del IdleGameService
  - [ ] Test: getOrCreatePlayer - crear jugador nuevo
  - [ ] Test: getOrCreatePlayer - obtener jugador existente
  - [ ] Test: processClick - validar coins aumentados
  - [ ] Test: buyUpgrade - validar compra exitosa
  - [ ] Test: buyUpgrade - validar coins insuficientes
  - [ ] Test: buyUpgrade - validar nivel máximo alcanzado
  - [ ] Test: calculateOfflineProgress - validar cálculo de progreso offline
  - [ ] Test: saveGame/loadGame - persistencia

#### Pruebas de Integración API REST
- [ ] GET /api/game/:playerId - obtener estado
- [ ] POST /api/game/:playerId/click - registrar click
- [ ] POST /api/game/:playerId/upgrade - comprar upgrade
- [ ] POST /api/game/:playerId/save - guardar estado
- [ ] DELETE /api/game/:playerId - eliminar datos
- [ ] Validar respuestas con upgrades correctos
- [ ] Validar errores 400/500

#### Test Unitarios Frontend
- [ ] Tests del gameStore (pure functions)
  - [ ] clickCoins - verificar incremento de coins
  - [ ] passiveIncome - verificar incremento por segundo
  - [ ] purchaseUpgrade - verificar compra exitosa
  - [ ] purchaseUpgrade - verificar coins insuficientes
  - [ ] purchaseUpgrade - verificar nivel máximo
  - [ ] canAfford - verificar boolean correcto

#### Pruebas Funcionales E2E (Playwright)
- [ ] Test: Flujo completo de clicks
- [ ] Test: Compra de upgrades
- [ ] Test: Generación pasiva de coins
- [ ] Test: Guardado y cargado de juego
- [ ] Test: Integración con servidor
- [ ] Test: Validar que las mejoras se acumulen correctamente
- [ ] Test: Validar nivel máximo de mejoras (no exceder)
- [ ] Test: Validar que mejoras no se solapen

---

### 🎮 Validaciones de Gameplay

---

### 🏗️ architect
- [x] Definir arquitectura completa (este documento)
- [x] Documentar flujo de datos
- [x] Definir контракт API entre cliente y servidor (ver docs/api-spec.md)
- [ ] Asegurar escalabilidad

---

### 📢 liveops_designer
- [ ] Diseñar sistema de logros (achievements)
- [ ] Diseñar recompensas diarias
- [ ] Diseñar eventos temporales
- [ ] Diseñar sistema de retención

---

## 🔗 Flujo de Datos (Arquitectura)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐   │
│   │             │      │             │      │             │   │
│   │   Phaser    │──────│    React   │──────│   Servidor  │   │
│   │  (Vista)    │◀─────│  (Store)   │◀─────│  (Futuro)   │   │
│   │             │      │             │      │             │   │
│   └─────────────┘      └─────────────┘      └─────────────┘   │
│        │                    │                     │             │
│   - Render             - Estado               - API            │
│   - Eventos           - Lógica               - WebSocket       │
│   - Animaciones       - Datos                - BD             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Comunicación:
- **Phaser → React**: Eventos de click, compra de upgrades
- **React → Phaser**: Estado actualizado (coins, upgrades, stats)
- **React → Servidor** (futuro): Sincronización, guardado

---

## 📡 Contrato API (Borrador)

### Endpoints REST

```
GET    /api/game/:userId      - Obtener estado del juego
POST   /api/game/:userId      - Guardar estado
POST   /api/game/:userId/click - Registrar click
POST   /api/game/:userId/buy   - Comprar upgrade
```

### WebSocket

```
connect    - Conectar al servidor
sync       - Sincronizar estado
save       - Guardar progreso
```

---

### 🎮 Validaciones de Gameplay

#### Validación: Mejoras se acumulen correctamente
- [ ] **Backend**: Cada compra suma al nivel anterior
- [ ] **Backend**: El efecto se aplica correctamente (click + passive)
- [ ] **Frontend**: Los cambios se reflejan en UI

#### Validación: Nivel máximo de mejoras
- [ ] **Backend**: No permite comprar más allá de maxLevel
- [ ] **Backend**: Retorna error "Max level reached"
- [ ] **Frontend**: Botón deshabilitado al llegar a maxLevel
- [ ] **Frontend**: UI muestra nivel actual vs máximo

#### Validación: Mejoras no se solapen
- [ ] Cada upgrade tiene ID único
- [ ] Los efectos de diferentes upgrades son independientes
- [ ] Los costs se calculan correctamente por upgrade

---

### 🎮 Validaciones de Gameplay

#### Validación: Mejoras se acumulen correctamente
- [ ] **Backend**: Cada compra suma al nivel anterior
- [ ] **Backend**: El efecto se aplica correctamente (click + passive)
- [ ] **Frontend**: Los cambios se reflejan en UI

#### Validación: Nivel máximo de mejoras
- [ ] **Backend**: No permite comprar más allá de maxLevel
- [ ] **Backend**: Retorna error "Max level reached"
- [ ] **Frontend**: Botón deshabilitado al llegar a maxLevel
- [ ] **Frontend**: UI muestra nivel actual vs máximo

#### Validación: Mejoras no se solapen
- [ ] Cada upgrade tiene ID único
- [ ] Los efectos de diferentes upgrades son independientes
- [ ] Los costs se calculan correctamente por upgrade

---

## 🧪 Stack de Testing

### Backend (Vitest)
```bash
cd server-cliker-ia
npm run test              # Ejecutar todos los tests
npm run test:watch       # Modo watch
```

### Frontend (Vitest + React Testing Library)
```bash
cd cliker-ia
npm run test             # Ejecutar tests unitarios
npm run test:coverage   # Con coverage
```

### E2E (Playwright)
```bash
# Requiere instalar Playwright
npx playwright install

# Ejecutar tests E2E
npx playwright test
```

---

## 📝 Notas

- Este documento se actualiza según avanza el proyecto
- Cada tarea debe completarse antes de integrar con el servidor
- QA debe testear cada feature antes de marcar como completada
- La arquitectura puede evolucionar según las necesidades
