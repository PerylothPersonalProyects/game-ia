# Design: Configuración de Proyectos Distribuidos

## Technical Approach

Implementar configuración centralizada mediante variables de entorno para permitir despliegue de Frontend, Backend y MongoDB en servidores distintos. Unificar la URL del servidor en el frontend usando `VITE_API_URL` y hacer CORS configurable en el backend mediante `CORS_ORIGIN`.

## Architecture Decisions

### Decision: Unificación de URL en Frontend

**Choice**: Usar `VITE_API_URL` para REST y WebSocket indistintamente  
**Alternatives considered**: Mantener `VITE_SERVER_URL` separado, detectar dinámicamente el servidor  
**Rationale**: Socket.io corre en el mismo servidor Express que las rutas REST. Una sola variable simplifica la configuración y reduce errores.

### Decision: CORS Configurable en Backend

**Choice**: Variable de entorno `CORS_ORIGIN`  
**Alternatives considered**: Lista blanca hardcodeada, middleware dinámico  
**Rationale**: Permite cambiar dominios sin modificar código. En desarrollo默认值 `*` facilita testing.

### Decision: MongoDB URI

**Choice**: `MONGODB_URI` ya existe, solo documentar  
**Alternatives considered**: Nueva variable, detección automática  
**Rationale**: Ya está implementado correctamente. Solo agregar documentación.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        cliker-ia (Frontend)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ gameApi.ts   │  │RestApiAdapter│  │ socketClient.ts     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼────────────────────┼──────────────┘
          │                  │                    │
          └──────────────────┴────────────────────┘
                              │
                    VITE_API_URL (única variable)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    server-cliker-ia (Backend)                    │
│  Express + Socket.io (Puerto configurable via PORT)              │
│  CORS: configurable via CORS_ORIGIN                             │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                  MONGODB_URI (mongodb://...)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MongoDB                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `cliker-ia/.env.example` | Create | Template de variables de entorno |
| `cliker-ia/src/api/socketClient.ts` | Modify | Usar `VITE_API_URL` en vez de `VITE_SERVER_URL` |
| `server-cliker-ia/src/index.ts` | Modify | CORS configurable via `CORS_ORIGIN` |
| `server-cliker-ia/.env.example` | Modify | Agregar `CORS_ORIGIN` |

## Interfaces / Contracts

### Environment Variables

**Frontend (cliker-ia/.env.example)**
```env
# URL del servidor backend (REST y WebSocket)
VITE_API_URL=http://localhost:3001
```

**Backend (server-cliker-ia/.env.example)**
```env
# MongoDB
MONGODB_URI=mongodb://admin:admin123@localhost:27017/clicker-game?authSource=admin
MONGODB_DB=clicker-game

# Server
PORT=3001
NODE_ENV=development

# CORS - Dominio(s) permitido(s)
CORS_ORIGIN=http://localhost:5173
```

### Variable Reference Table

| Variable | Proyecto | Default | Descripción |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Frontend | `http://localhost:3001` | URL completa del servidor |
| `MONGODB_URI` | Backend | `mongodb://...` | URI de conexión MongoDB |
| `MONGODB_DB` | Backend | `clicker-game` | Nombre de la base de datos |
| `PORT` | Backend | `3001` | Puerto del servidor |
| `CORS_ORIGIN` | Backend | `*` | Dominios CORS permitidos |
| `NODE_ENV` | Backend | `development` | Entorno |

## Code Changes

### 1. cliker-ia/src/api/socketClient.ts

```typescript
// ANTES (línea 4):
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// DESPUÉS:
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### 2. server-cliker-ia/src/index.ts

```typescript
// AGREGAR después de las constantes existentes:
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// MODIFICAR cors() de Express:
app.use(cors({
  origin: CORS_ORIGIN,
}));

// MODIFICAR cors de Socket.io:
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});
```

### 3. cliker-ia/.env.example (nuevo archivo)

```env
# URL del servidor backend (REST y WebSocket)
VITE_API_URL=http://localhost:3001
```

### 4. server-cliker-ia/.env.example

```env
# Agregar al final:
# CORS - Dominio(s) permitido(s) para desarrollo local
CORS_ORIGIN=http://localhost:5173
```

## Security Considerations

| Aspecto | Medida |
|---------|--------|
| CORS producción | Configurar `CORS_ORIGIN` con dominio(s) específico(s) |
| CORS desarrollo | Valor por defecto `*` permite testing sin configuración |
| Credenciales MongoDB | URI incluye credenciales - NO commitear `.env` real |
| Variables frontend | Prefijo `VITE_` es seguro (existe solo en build-time) |

## Migration / Rollout

1. **Agregar `.env`** en cada proyecto con las URLs correspondientes
2. **Deployar backend** primero con `CORS_ORIGIN` configurado
3. **Deployar frontend** con `VITE_API_URL` apuntando al servidor
4. No requiere migración de datos

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Variables de entorno con valores inválidos | Test con Jest/Vitest |
| Integration | Conexión Front → Backend → MongoDB | Scripts de integración |
| E2E | Deploy en servidores distintos | Playwright con URLs reales |

## Open Questions

- [ ] ¿Se necesita soporte para múltiples dominios CORS (separados por coma)?
- [ ] ¿Debe el frontend detectar dinámicamente el servidor (service discovery)?
