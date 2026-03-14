# API Specification - Idle Clicker Game

## 📋 Resumen del Juego

El jugador:
1. hace **CLICK** para ganar monedas
2. Las monedas se generan **PASIVAMENTE** cada segundo
3. Usa monedas para comprar **UPGRADES**
4. Los upgrades aumentan: coins por click O coins por segundo
5. Los costos suben exponencialmente

---

## 🎮 Estado del Juego (GameState)

```typescript
interface Upgrade {
  id: string;           // "cursor", "grandma", "farm", "mine", "factory"
  name: string;         // "Cursor", "Abuela", "Granja", "Mina", "Fabrica"
  description: string;  // "+1 moneda por click", "+1 moneda por segundo", etc.
  cost: number;         // Costo base (ej: 10)
  costMultiplier: number;// Multiplicador de costo (ej: 1.5)
  effect: number;       // Efecto del upgrade (ej: +1)
  maxLevel: number;    // Nivel máximo (ej: 100)
  purchased: number;   // Veces comprado (nivel actual)
}

interface GameState {
  coins: number;           // Monedas actuales (float)
  coinsPerClick: number;   // Monedas por click (int)
  coinsPerSecond: number;   // Monedas por segundo (int)
  upgrades: Upgrade[];      // Lista de upgrades
}
```

### Upgrades Actuales (definidos en el frontend)

| ID | Nombre | Descripción | Costo Base | Multiplicador | Efecto | Max Level |
|----|--------|-------------|------------|---------------|--------|-----------|
| cursor | Cursor | +1 por click | 10 | 1.5 | +1 | 100 |
| grandma | Abuela | +1 por segundo | 50 | 1.4 | +1 | 50 |
| farm | Granja | +5 por segundo | 200 | 1.3 | +5 | 30 |
| mine | Mina | +15 por segundo | 1000 | 1.25 | +15 | 20 |
| factory | Fabrica | +50 por segundo | 5000 | 1.2 | +50 | 10 |

### Fórmula de Costo

```
costo_actual = floor(costo_base * (multiplicador ^ purchased))
```

---

## 🔌 API REST

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/game/:userId` | Obtener estado del juego |
| POST | `/api/game/:userId` | Guardar estado completo |
| POST | `/api/game/:userId/click` | Registrar click (retorna nuevas monedas) |
| POST | `/api/game/:userId/upgrade/:upgradeId` | Comprar upgrade |
| POST | `/api/game/:userId/sync` | Sincronizar estado (handshake) |

---

## 📥 Request/Response

### GET /api/game/:userId

**Response:**
```json
{
  "coins": 150,
  "coinsPerClick": 2,
  "coinsPerSecond": 5,
  "upgrades": [
    {
      "id": "cursor",
      "name": "Cursor",
      "description": "+1 moneda por click",
      "cost": 10,
      "costMultiplier": 1.5,
      "effect": 1,
      "maxLevel": 100,
      "purchased": 1
    },
    ...
  ]
}
```

### POST /api/game/:userId/click

**Request Body:**
```json
{
  "currentCoins": 10,
  "coinsPerClick": 1
}
```

**Response:**
```json
{
  "success": true,
  "newCoins": 11
}
```

### POST /api/game/:userId/upgrade/:upgradeId

**Request Body:**
```json
{
  "currentCoins": 100,
  "upgradeId": "cursor"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "newCoins": 90,
  "upgradePurchased": {
    "id": "cursor",
    "purchased": 2
  },
  "newCoinsPerClick": 2
}
```

**Response (error - no alcanza el dinero):**
```json
{
  "success": false,
  "error": "INSUFFICIENT_COINS",
  "required": 15,
  "available": 10
}
```

---

## 🔄 WebSocket (Tiempo Real)

### Eventos Client → Server

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `join` | `{ userId: string }` | Unirse al juego |
| `click` | `{ coinsPerClick: number }` | Click realizado |
| `buy` | `{ upgradeId: string }` | Comprar upgrade |
| `sync` | `{ state: GameState }` | Sincronizar estado |

### Eventos Server → Client

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `state_update` | `{ coins: number, ... }` | Estado actualizado |
| `error` | `{ code: string, message: string }` | Error |
| `saved` | `{ timestamp: number }` | Confirmación de guardado |

---

## 💾 Persistencia

### Estructura en Base de Datos

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_states (
  user_id INTEGER REFERENCES users(id),
  coins FLOAT DEFAULT 0,
  coins_per_click INTEGER DEFAULT 1,
  coins_per_second INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

CREATE TABLE user_upgrades (
  user_id INTEGER REFERENCES users(id),
  upgrade_id VARCHAR(20),
  purchased INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, upgrade_id)
);
```

---

## 🔐 Autenticación

Por ahora (MVP):
- Sin autenticación
- `userId` puede ser cualquier string (generado en cliente)

Futuro:
- JWT tokens
- Login con Google/Apple

---

## ⚠️ Notas Importantes

1. **Monedas son float** - Pueden tener decimales por la generación pasiva
2. **Upserts** - Usar UPSERT para compras atómicas
3. **Validación** - Siempre validar coins en servidor
4. **Timestamps** - Guardar `last_updated` para calcular ganancias offline

---

## 📊 Métricas del Juego (para analytics)

- `total_clicks` - Clicks totales del jugador
- `total_coins_earned` - Monedas ganadas en total
- `upgrades_purchased` - Total de upgrades comprados
- `play_time_seconds` - Tiempo de juego
- `offline_earnings` - Ganancias mientras estuvo fuera
