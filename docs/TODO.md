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
- [ ] *(Todas las tareas completadas)*

---

### 🔧 frontend (React)
- [ ] *(Todas las tareas completadas)*

---

### 🖥️ backend (Node.js)
- [ ] *(Todas las tareas completadas)*

---

### 🧪 QA - Testing
- [ ] *(Todos los tests pasando: 199/199)*

---

### 🏗️ architect
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

## 📡 Contrato API

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

## 🎮 Validaciones de Gameplay (Pendientes)

### Validación: Mejoras se acumulen correctamente
- [ ] **Backend**: Cada compra suma al nivel anterior
- [ ] **Backend**: El efecto se aplica correctamente (click + passive)
- [ ] **Frontend**: Los cambios se reflejan en UI

### Validación: Nivel máximo de mejoras
- [ ] **Backend**: No permite comprar más allá de maxLevel
- [ ] **Backend**: Retorna error "Max level reached"
- [ ] **Frontend**: Botón deshabilitado al llegar a maxLevel
- [ ] **Frontend**: UI muestra nivel actual vs máximo

### Validación: Mejoras no se solapen
- [ ] Cada upgrade tiene ID único
- [ ] Los efectos de diferentes upgrades son independientes
- [ ] Los costs se calculan correctamente por upgrade

---

## 🧪 Stack de Testing

### Backend (Vitest)
- Estado: ✅ Configurado
- Coverage: 23.78% statements (91.69% en use cases)

### Frontend (Vitest)
- Estado: ✅ Configurado
- Coverage: 11.12% statements

### E2E + API (Playwright)
- Estado: ✅ 23/23 tests pasando

### Karate API
- Estado: ✅ 8/8 tests pasando

### CI/CD GitHub Actions
- [x] Crear .github/workflows/test.yml
- [ ] Verificar que el workflow corre correctamente
- [ ] Configurar coverage thresholds

---

## 📝 Notas

- Este documento se actualiza según avanza el proyecto
- Cada tarea debe completarse antes de integrar con el servidor
- QA debe testear cada feature antes de marcar como completada
- La arquitectura puede evolucionar según las necesidades

---

## 📊 Resumen de Estado (2026-03-22)

| Área | Estado |
|------|--------|
| Backend | ✅ Completado |
| Frontend | ✅ Completado |
| Tests | ✅ 199/199 pasando |
| UI/UX | ⏳ Pendiente |
| LiveOps | ⏳ Pendiente |
| Escalabilidad | ⏳ Pendiente |
| CI/CD | 🔄 Parcial |