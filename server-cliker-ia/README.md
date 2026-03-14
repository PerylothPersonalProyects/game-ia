# Backend - Idle Clicker Game

Servidor Node.js con Express, Socket.io y MongoDB para el juego idle clicker.

## Tecnologías

- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Base de Datos**: MongoDB (Mongoose)
- **Lenguaje**: TypeScript

## Requisitos

- Node.js 18+
- Docker (para MongoDB)

##快速开始

### 1. Levantar MongoDB con Docker

```bash
docker-compose up -d
```

Esto inicia:
- **MongoDB**: `localhost:27017`
- **Mongo Express** (UI): `localhost:8081`

Credenciales: `admin` / `admin123`

### 2. Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción (compilado)
npm run build
npm start
```

El servidor corre en `http://localhost:3001`

## Comandos

```bash
npm install        # Instalar dependencias
npm run dev        # Iniciar servidor (desarrollo con watch)
npm run build      # Compilar TypeScript
npm run start      # Iniciar servidor (producción)
npm run test       # Ejecutar tests
```

## Gestionar MongoDB

### Ver la base de datos

Accedé a Mongo Express: `http://localhost:8081`

### Borrar la base de datos

```bash
# Opción 1: Desde Mongo Express
# Ir a http://localhost:8081 y eliminar la colección "players"

# Opción 2: Desde Docker
docker exec -it clicker-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.dropDatabase()"

# Opción 3: Con mongosh interactivo
docker exec -it clicker-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Ver logs de MongoDB

```bash
docker logs clicker-mongodb
```

### Detener MongoDB

```bash
docker-compose down          # Detener contenedores
docker-compose down -v      # Detener Y BORRAR datos
```

## Estructura del Proyecto

```
server-cliker-ia/
├── src/
│   ├── api/
│   │   ├── controllers/    # Controladores REST
│   │   └── routes/        # Rutas Express
│   ├── database/
│   │   ├── connection.ts  # Conexión MongoDB
│   │   └── models/        # Modelos Mongoose
│   ├── services/          # Lógica de negocio
│   ├── socket/            # Handlers Socket.io
│   ├── types/             # Tipos TypeScript
│   └── index.ts           # Entry point
├── docker-compose.yml     # MongoDB + Mongo Express
├── .env.example           # Variables de entorno
└── package.json
```

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/game/:playerId` | Obtener estado del juego |
| GET | `/api/game/:playerId/sync` | Sincronización rápida |
| GET | `/api/game/:playerId/upgrades` | Obtener upgrades |
| POST | `/api/game/:playerId/click` | Registrar click |
| POST | `/api/game/:playerId/upgrade` | Comprar upgrade |
| POST | `/api/game/:playerId/save` | Guardar estado |
| DELETE | `/api/game/:playerId` | Eliminar datos |

## WebSocket (Multiplayer)

| Evento | Descripción |
|--------|-------------|
| `create_room` | Crear sala |
| `join_room` | Unirse a sala |
| `leave_room` | Salir de sala |
| `get_rooms` | Listar salas |
| `create_shop` | Crear tienda |
| `get_shops` | Listar tiendas |
| `buy_item` | Comprar item |

## Variables de Entorno

Copia `.env.example` a `.env`:

```env
# Desarrollo local
MONGODB_URI=mongodb://admin:admin123@localhost:27017/clicker-game?authSource=admin
MONGODB_DB=clicker-game

# Producción (PDN)
# MONGODB_URI=mongodb://admin:admin123@<IP_PDN>:27017/clicker-game?authSource=admin

PORT=3001
NODE_ENV=development
```

## Documentación API

- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/openapi.json`

## Tests

```bash
npm run test        # Ejecutar tests una vez
npm run test:watch # Tests en watch mode
```

## Mejoras del Juego (Upgrades)

Las mejoras se almacenan en MongoDB y se cargan dinámicamente.

### Desarrollo Local

```bash
# Listar todas las mejoras
npx tsx scripts/manage-upgrades.ts list

# Agregar mejoras de ejemplo (8 upgrades)
npx tsx scripts/add-upgrades.ts

# Crear/resetear mejoras por defecto
npx tsx scripts/manage-upgrades.ts seed
```

### Producción (PDN)

Para tener las mejoras en el servidor de producción:

```bash
# 1. Configurar las variables de entorno
export MONGODB_URI="mongodb://admin:admin123@<PDN_IP>:27017/clicker-game?authSource=admin"

# 2. Ejecutar el script de mejoras
npx tsx scripts/add-upgrades.ts

# También puedes usar manage-upgrades para otras operaciones:
npx tsx scripts/manage-upgrades.ts list
```

### Available Scripts

| Comando | Descripción |
|---------|-------------|
| `scripts/add-upgrades.ts` | Agrega las 8 mejoras del juego |
| `scripts/manage-upgrades.ts list` | Lista todas las mejoras |
| `scripts/manage-upgrades.ts seed` | Crea mejoras por defecto |
| `scripts/manage-upgrades.ts add <json>` | Agregar mejora |
| `scripts/manage-upgrades.ts update <id> <json>` | Actualizar mejora |
| `scripts/manage-upgrades.ts delete <id>` | Eliminar mejora |

### Agregar/Editar Mejoras Manualmente

```bash
# Agregar nueva mejora
npx tsx scripts/manage-upgrades.ts add '{"id":"click_5","name":"Mega Click","description":"+500 por click","baseCost":100000,"effect":500,"type":"click","maxLevel":5}'

# Actualizar mejora existente
npx tsx scripts/manage-upgrades.ts update click_1 '{"baseCost":15,"effect":2}'

# Eliminar mejora
npx tsx scripts/manage-upgrades.ts delete click_1
```

### Estructura de una Mejora

```json
{
  "id": "click_1",
  "name": "Dedo Rápido",
  "description": "+1 moneda por click",
  "baseCost": 10,
  "costMultiplier": 1.5,
  "effect": 1,
  "maxLevel": 100,
  "type": "click" | "passive",
  "enabled": true
}
```

### Notas sobre Migraciones

MongoDB no requiere migraciones formales. Los cambios en las mejoras se aplican directamente:
- Al iniciar el servidor, hace seed automático de las mejoras por defecto
- Los jugadores existentes reciben nuevas mejoras automáticamente
- Usa los scripts acima para agregar/editar mejoras
