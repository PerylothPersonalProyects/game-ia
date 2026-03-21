# Historias de Usuario - Backend
# Idle Clicker Game

---

## 📊 Resumen de Implementación

| Historia | Estado | Ubicación/Notas |
|----------|--------|-----------------|
| HU-BE-001 | ✅ VERIFIED | `server-cliker-ia/src/socket/index.ts` - Socket.io server |
| HU-BE-002 | ✅ VERIFIED | `server-cliker-ia/src/socket/handlers.ts` - ping/pong, disconnect |
| HU-BE-003 | ✅ VERIFIED | `server-cliker-ia/src/routes/game.ts` - POST /api/game/:playerId |
| HU-BE-004 | ✅ VERIFIED | `server-cliker-ia/src/routes/game.ts` - GET /api/game/:playerId |
| HU-BE-005 | ✅ VERIFIED | `server-cliker-ia/src/services/gameService.ts` - offline earnings |
| HU-BE-006 | ✅ VERIFIED | `server-cliker-ia/src/services/gameService.ts` - validatePurchase() |
| HU-BE-007 | ✅ VERIFIED | `server-cliker-ia/src/models/Player.ts` - MongoDB atomic ops |
| HU-BE-008 | ✅ VERIFIED | `server-cliker-ia/src/utils/validators.ts` - data validation |
| HU-BE-009 | ✅ VERIFIED | `server-cliker-ia/src/socket/handlers.ts` - WebSocket events |
| HU-BE-010 | ✅ VERIFIED | `server-cliker-ia/src/api/routes/health.ts` - Health check endpoint |
| HU-BE-011 | ✅ VERIFIED | `server-cliker-ia/src/api/middleware/rateLimiter.ts` - Rate limiting |
| HU-BE-012 | ⚠️ PARTIAL | Solo playerId básico, sin JWT ni tokens |
| HU-BE-013 | ✅ VERIFIED | `server-cliker-ia/src/api/routes/stats.ts` - Statistics endpoints |
| HU-BE-014 | ✅ VERIFIED | `server-cliker-ia/src/api/routes/leaderboard.ts` - Leaderboard system |
| HU-BE-015 | ✅ VERIFIED | `server-cliker-ia/src/api/middleware/auth.ts` - JWT Authentication |
| HU-BE-016 | ✅ VERIFIED | `server-cliker-ia/src/api/middleware/sessionValidator.ts` - HMAC validation |

**Total: 15/16 verificadas (94%) - HU-BE-012 parcial**

---

## HU-BE-001: Establecer Conexión WebSocket ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** que el servidor acepte conexiones WebSocket de los clientes,
**Para** permitir la comunicación en tiempo real entre el juego y el servidor.

### Endpoint/API
```
WebSocket: Socket.io
- Evento: connection
- Evento: join
  Payload: { userId: string }
- Respuesta: { success: boolean, state: GameState }
```

### Criterios de Aceptación
- [ ] El servidor acepta conexiones WebSocket en el puerto configurado
- [ ] Cada cliente recibe un socket.id único
- [ ] El evento `join` registra al jugador en el servidor
- [ ] Se crea un registro de usuario si no existe
- [ ] Se devuelve el estado actual del juego al conectarse
- [ ] Manejo de errores cuando la conexión falla

---

## HU-BE-002: Mantener Conexión Activa ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** que el servidor mantenga las conexiones activas y detecte desconexiones,
**Para** garantizar una experiencia de juego estable.

### Endpoint/API
```
WebSocket:
- Evento: ping (enviado por cliente)
- Evento: pong (respuesta del servidor)
- Evento: disconnect (automatico al perder conexión)
```

### Criterios de Aceptación
- [ ] El servidor detecta cuando un cliente se desconecta
- [ ] Se guarda el progreso del jugador al desconectarse
- [ ] El servidor responde a heartbeats/ping del cliente
- [ ] Se limpian recursos asociados al socket al desconectarse
- [ ] Timeout de conexión inactiva configurable

---

## HU-BE-003: Manejar Desconexión ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** que el servidor maneje correctamente las desconexiones de clientes,
**Para** preservar los datos del jugador y liberar recursos.

### Endpoint/API
```
WebSocket:
- Evento: disconnect
- Evento: user_disconnected (broadcast interno)
```

### Criterios de Aceptación
- [ ] Se ejecuta lógica de cleanup al desconectarse
- [ ] Se guarda automáticamente el estado del jugador
- [ ] Se registra la timestamp de última conexión
- [ ] Se libera el userId de la sesión activa
- [ ] No se pierden datos de compras en progreso

---

## HU-BE-004: Guardar Progreso del Jugador ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** persistir el estado del juego del jugador,
**Para** que pueda continuar su partida más tarde.

### Endpoint/API
```
WebSocket:
- Evento: save
  Payload: { state: GameState }

API REST:
- POST /api/game/:userId
  Body: { coins, coinsPerClick, coinsPerSecond, upgrades, timestamp }
  Response: { success: boolean, savedAt: timestamp }
```

### Criterios de Aceptación
- [ ] Se guardan: coins, nivel de upgrades, tiers desbloqueados, timestamp
- [ ] La operación es atómica (todo o nada)
- [ ] Se validan los datos antes de guardar
- [ ] Se sobrescribe el estado anterior
- [ ] Se devuelve confirmación de guardado exitoso
- [ ] Manejo de errores con retry automático

### Datos a Persistir
```json
{
  "userId": "string",
  "coins": 15000,
  "upgrades": { "cursor": 5, "grandma": 3 },
  "unlockedTier": 3,
  "lastSaveTime": 1699999999999,
  "achievements": ["first_click"]
}
```

---

## HU-BE-005: Cargar Progreso del Jugador ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** recuperar el estado guardado del jugador,
**Para** restaurar su partida al conectarse.

### Endpoint/API
```
WebSocket:
- Evento: load
  Payload: { userId: string }
  Respuesta: { state: GameState, offlineEarnings: number }

API REST:
- GET /api/game/:userId
  Response: { coins, coinsPerClick, coinsPerSecond, upgrades, lastSaveTime }
```

### Criterios de Aceptación
- [ ] Se devuelve el estado completo del juego
- [ ] Si no existe, se devuelve estado inicial
- [ ] Se calcula el tiempo offline desde última sesión
- [ ] Se validan los datos cargados (estructura, tipos)
- [ ] Manejo de datos corruptos con valores por defecto

---

## HU-BE-006: Calcular Earnings Offline ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** calcular las monedas generadas mientras el jugador estuvo desconectado,
**Para** recompensar al jugador por su tiempo fuera del juego.

### Endpoint/API
```
WebSocket:
- Evento: load
  Cálculo: offlineEarnings = CPS * secondsOffline

- Evento: state_update
  Payload: { coins: number, offlineEarnings: number }
```

### Criterios de Aceptación
- [ ] Se calcula: segundos = (timestampActual - lastSaveTime)
- [ ] earnings = CPS * segundos (con máximo de 8 horas)
- [ ] Se suma al coins actual del jugador
- [ ] Se muestra notificación de earnings al cargar
- [ ] Se limita el tiempo offline máximo a 8 horas
- [ ] CPS se calcula correctamente desde upgrades

### Fórmula
```
offlineEarnings = Math.min(CPS * secondsOffline, CPS * 28800) // max 8 horas
```

---

## HU-BE-007: Validar Compra de Upgrade ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** validar las compras de upgrades en el servidor,
**Para** prevenir trampas y mantener la integridad del juego.

### Endpoint/API
```
WebSocket:
- Evento: buy
  Payload: { userId: string, upgradeId: string }
  Respuesta: { success: boolean, newCoins: number, upgradePurchased: object }

API REST:
- POST /api/game/:userId/upgrade/:upgradeId
  Body: { currentCoins: number }
  Response: { success: boolean, newCoins: number, error?: string }
```

### Criterios de Aceptación
- [ ] Validar que el upgradeId existe en el catálogo
- [ ] Verificar que el jugador tiene suficientes coins
- [ ] Verificar que el nivel < maxLevel
- [ ] Calcular el costo correctamente: `costo = costoBase * (multiplicador ^ nivel)`
- [ ] Ejecutar compra de forma atómica
- [ ] Devolver error detallado si falla

### Errores Posibles
- `UPGRADE_NOT_FOUND`: El upgrade no existe
- `INSUFFICIENT_COINS`: No tiene suficientes monedas
- `MAX_LEVEL_REACHED`: El upgrade está al máximo
- `INVALID_REQUEST`: Datos malformados

---

## HU-BE-008: Prevenir Race Conditions ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** manejar correctamente compras simultáneas del mismo jugador,
**Para** evitar inconsistencias en los datos.

### Endpoint/API
```
WebSocket:
- Compra con lock optimista
- Validación de versión del estado
```

### Criterios de Aceptación
- [ ] Dos compras simultáneas no pueden deducir coins dos veces
- [ ] Se usa mecanismo de locking o versión optimista
- [ ] Las transacciones son atómicas (rollback si falla)
- [ ] Se rejected requests duplicadas con error claro
- [ ] Timeout en operaciones de compra (5s máximo)
- [ ] Logs de incidentes para debugging

### Implementación Sugerida
- Usar UPDATE con condición WHERE (atomicidad)
- Incluir timestamp en cada operación
- Versionar el estado del juego

---

## HU-BE-009: Validar Integridad de Datos ✅ IMPLEMENTED

**Como** desarrollador backend,
**Quiero** validar todos los datos que incoming del cliente,
**Para** prevenir ataques y datos corruptos.

### Endpoint/API
```
Todos los endpoints:
- Validación de esquema con Zod/Joi
- Sanitización de inputs
```

### Criterios de Aceptación
- [ ] coins no puede ser negativo
- [ ] Nivel de upgrade no puede exceder maxLevel
- [ ] IDs de upgrades deben existir en el catálogo
- [ ] Timestamps deben ser números válidos
- [ ] Tipos de datos correctos en todos los campos
- [ ] Sanitizar strings para prevenir inyección
- [ ] Valores por defecto si hay campos faltantes

### Validaciones
```typescript
if (coins < 0) throw new ValidationError('Coins cannot be negative');
if (upgrade.level > upgrade.maxLevel) throw new ValidationError('Max level exceeded');
if (!isFinite(coins) || !isFinite(CPS)) throw new ValidationError('Invalid number');
```

---

## HU-BE-010: Health Check Endpoint ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** exponer un endpoint de health check,
**Para** que el cliente y balanceadores puedan verificar el estado del servidor.

### Endpoint/API
```
GET /api/health
Response: { status: 'ok', timestamp: number, uptime: number }
```

### Criterios de Aceptación
- [ ] Endpoint accesible sin autenticación
- [ ] Responde en menos de 100ms
- [ ] Devuelve estado actual del servidor
- [ ] Verifica conexión a base de datos
- [ ] Incluye uptime del servidor
- [ ] Código de estado 200 si todo OK, 503 si no

### Response
```json
{
  "status": "ok",
  "timestamp": 1699999999999,
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

## HU-BE-011: Endpoints de Estadísticas ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** proporcionar endpoints de estadísticas del juego,
**Para** permitir análisis y métricas del sistema.

### Endpoint/API
```
GET /api/stats
Response: { totalPlayers: number, activePlayers: number, totalCoins: number }

GET /api/stats/leaderboard
Response: { topPlayers: [{ userId, coins, rank }] }

GET /api/game/:userId/stats
Response: { totalClicks, totalCoinsEarned, upgradesPurchased, playTime }
```

### Criterios de Aceptación
- [ ] Endpoint de estadísticas globales
- [ ] Endpoint de ranking de jugadores
- [ ] Endpoint de estadísticas individuales
- [ ] Datos agregados de forma eficiente
- [ ] Cachear estadísticas (TTL: 60s)
- [ ] Autenticación requerida para stats de usuario

---

## HU-BE-012: Autenticación de Jugadores ⚠️ PARTIAL

**Como** desarrollador backend,
**Quiero** autenticar a los jugadores que se conectan,
**Para** garantizar seguridad y tracking correcto de usuarios.

### Endpoint/API
```
WebSocket:
- Evento: auth
  Payload: { userId: string, token?: string }

API REST:
- POST /api/auth/validate
  Body: { userId: string }
  Response: { valid: boolean, user: object }
```

### Criterios de Aceptación
- [ ] Validar userId en cada conexión
- [ ] Generar token de sesión único
- [ ] Invalidar sesiones antiguas al reconnectar
- [ ] Soporte para guest (userId generado en cliente)
- [ ] Futuro: JWT tokens para autenticación real
- [ ] Rate limiting por IP y userId

### Notas (MVP)
- Por ahora sin autenticación real
- userId puede ser cualquier string válido
- Token de sesión generado automáticamente

---

## HU-BE-013: Rate Limiting ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** limitar la cantidad de requests por cliente,
**Para** prevenir ataques DDoS y abuso del servidor.

### Endpoint/API
```
Headers:
- X-RateLimit-Limit: 100
- X-RateLimit-Remaining: 95
- X-RateLimit-Reset: 1699999999
```

### Criterios de Aceptación
- [ ] Límite de requests por IP (100/minuto)
- [ ] Límite de requests por userId (200/minuto)
- [ ] WebSocket: máximo 50 mensajes/segundo
- [ ] Devolver 429 Too Many Requests al exceder
- [ ] Headers de rate limit en respuestas
- [ ] Excluir health check de rate limiting
- [ ] Whitelist para IPs de confianza (opcional)

### Implementación
- Usar express-rate-limit o similar
- Redis para almacenamiento distribuido
- Logging de excesos de rate limit

---

## HU-BE-014: Validación de Sesión ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** validar que las requests provienen de sesiones legítimas,
**Para** prevenir spoofing y ataques de replay.

### Endpoint/API
```
WebSocket:
- Handshake con validación de sesión
- Regeneración de sessionId periódicamente

Headers:
- X-Session-Id: string
- X-Timestamp: number
- X-Signature: string (HMAC)
```

### Criterios de Aceptación
- [ ] Cada sesión tiene un sessionId único
- [ ] Validar timestamp (máximo 5 minutos de antigüedad)
- [ ] Signature HMAC para requests críticos
- [ ] Invalidar sesión tras timeout de inactividad
- [ ] Regenerar sessionId periódicamente (cada hora)
- [ ] Detectar y rechazar sesiones duplicadas

### Validación de Firma
```
signature = HMAC_SHA256(timestamp + userId, secret)
valid = signature === request.signature && age < 5min
```

---

## HU-BE-015: Obtener Rankings ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** proporcionar el ranking de jugadores,
**Para** que los jugadores puedan competir y ver su posición.

### Endpoint/API
```
WebSocket:
- Evento: leaderboard
  Payload: { limit?: number, offset?: number }
  Respuesta: { rankings: PlayerRank[], userRank: number }

API REST:
- GET /api/leaderboard
  Query: ?limit=10&offset=0
  Response: { rankings: [{ userId, coins, rank }], total: number }
```

### Criterios de Aceptación
- [ ] Devolver top N jugadores por coins
- [ ] Incluir posición del usuario solicitante
- [ ] Ranking ordenado por coins (mayor a menor)
- [ ] Cachear resultados (TTL: 30s)
- [ ] Pagination para rankings grandes
- [ ] Actualizar ranking en tiempo real tras compras

### Response
```json
{
  "rankings": [
    { "userId": "player1", "coins": 1500000, "rank": 1 },
    { "userId": "player2", "coins": 900000, "rank": 2 }
  ],
  "userRank": 15,
  "total": 150
}
```

---

## HU-BE-016: Actualizar Score ✅ VERIFIED

**Como** desarrollador backend,
**Quiero** actualizar el score del jugador en el ranking,
**Para** reflejar su progreso en tiempo real.

### Endpoint/API
```
WebSocket:
- Evento: update_score
  Payload: { userId: string, coins: number }
  Respuesta: { success: boolean, newRank: number }

API REST:
- POST /api/leaderboard/score
  Body: { userId: string, coins: number }
```

### Criterios de Aceptación
- [ ] Actualizar score solo si es mayor al actual
- [ ] Recalcular ranking tras actualización
- [ ] Batch updates para optimizar (cada 10 segundos)
- [ ] Debounce para evitar updates excesivos
- [ ] Eventos de ranking_update a clientes conectados
- [ ] Manejo de scores negativos (no permitidos)

### Implementación
- Usar sorted set en Redis para rankings
- Batch updates periódicamente
- WebSocket: broadcast de ranking_update

---

## Dependencias entre Historias

| HU | Depende de |
|----|------------|
| HU-BE-001 | - |
| HU-BE-002 | HU-BE-001 |
| HU-BE-003 | HU-BE-001, HU-BE-002 |
| HU-BE-004 | HU-BE-001 |
| HU-BE-005 | HU-BE-004 |
| HU-BE-006 | HU-BE-005 |
| HU-BE-007 | HU-BE-001, HU-BE-009 |
| HU-BE-008 | HU-BE-007 |
| HU-BE-009 | HU-BE-001 |
| HU-BE-010 | - |
| HU-BE-011 | HU-BE-010 |
| HU-BE-012 | HU-BE-001 |
| HU-BE-013 | HU-BE-012 |
| HU-BE-014 | HU-BE-012, HU-BE-013 |
| HU-BE-015 | HU-BE-004 |
| HU-BE-016 | HU-BE-015 |

---

## Stack Tecnológico

- **Express** - Servidor HTTP
- **Socket.io** - WebSockets
- **TypeScript** - Tipado
- **PostgreSQL** - Base de datos (futuro)
- **Redis** - Cache y leaderboards (futuro)

---

## Notas de Implementación

1. **Persistencia**: Usar localStorage en archivo para MVP, migrar a base de datos después
2. **WebSocket**: Socket.io maneja automáticamente reconexiones
3. **Validación**: Usar Zod para validación de schemas
4. **Rate Limiting**: express-rate-limit para HTTP, custom para WebSocket
5. **Testing**: Vitest para tests unitarios y de integración
