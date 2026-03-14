/**
 * @openapi
 * 
 * info:
 *   title: Idle Clicker Game API
 *   version: 1.0.0
 *   description: |
 *     API para el juego Idle Clicker con soporte REST y WebSocket.
 *     
 *     ### Endpoints REST
 *     - GET /api/game/:playerId - Obtener estado del juego
 *     - POST /api/game/:playerId/click - Registrar click
 *     - POST /api/game/:playerId/upgrade - Comprar upgrade
 *     - POST /api/game/:playerId/save - Guardar estado
 *     
 *     ### WebSocket
 *     Eventos para funcionalidad multiplayer (salas, tiendas)
 * 
 * servers:
 *   - url: http://localhost:3001
 *     description: Servidor de desarrollo
 */

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Idle Clicker Game API',
      version: '1.0.0',
      description: `
## Endpoints REST (Idle Game)

### GET /api/game/:playerId
Obtiene el estado actual del juego, incluyendo progreso offline.

### POST /api/game/:playerId/click
Registra un click y añade monedas basadas en el clickPower.

### POST /api/game/:playerId/upgrade
Compra un upgrade para mejorar clickPower o passiveIncome.

### POST /api/game/:playerId/save
Guarda el estado completo del juego.

## WebSocket (Multiplayer)

### Eventos del Cliente → Servidor

| Evento | Descripción |
|--------|-------------|
| create_room | Crear nueva sala |
| join_room | Unirse a una sala |
| leave_room | Salir de la sala |
| get_rooms | Listar salas disponibles |
| create_shop | Crear tienda |
| get_shops | Listar tiendas de la sala |
| get_shop_status | Ver items de una tienda |
| buy_item | Comprar item |
| sell_item | Vender item |
| get_inventory | Ver inventario del jugador |

### Eventos del Servidor → Cliente

| Evento | Descripción |
|--------|-------------|
| rooms_list | Lista de salas |
| room_joined | Confirmación de unión a sala |
| player_joined | Nuevo jugador entró |
| player_left | Jugador salió |
| shop_created | Tienda creada |
| shops_list | Lista de tiendas |
| shop_status | Estado de items de tienda |
| shop_updated | Tienda actualizada |
| inventory_updated | Inventario actualizado |
| error | Error de operación |

### Códigos de Error

| Código | Descripción |
|--------|-------------|
| ROOM_FULL | Sala llena |
| ROOM_NOT_FOUND | Sala no existe |
| MAX_ROOMS_REACHED | Límite de salas alcanzado |
| MAX_SHOPS_PER_ROOM | Límite de tiendas alcanzado |
| INSUFFICIENT_COINS | Coins insuficientes |
| OUT_OF_STOCK | Sin stock |
| ITEM_EXPIRED | Item expirado |
| NOT_ENOUGH_ITEMS | No tienes el item |
      `,
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        // Idle Game Schemas
        PlayerState: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID del jugador' },
            coins: { type: 'number', description: 'Monedas actuales' },
            clickPower: { type: 'number', description: 'Poder de click' },
            passiveIncome: { type: 'number', description: 'Ingreso pasivo por segundo' },
            lastUpdate: { type: 'number', description: 'Última actualización (timestamp)' },
          },
        },
        Upgrade: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID del upgrade' },
            level: { type: 'number', description: 'Nivel actual' },
            cost: { type: 'number', description: 'Costo actual' },
            multiplier: { type: 'number', description: 'Multiplicador de costo' },
          },
        },
        GameState: {
          type: 'object',
          properties: {
            player: { $ref: '#/components/schemas/PlayerState' },
            upgrades: {
              type: 'array',
              items: { $ref: '#/components/schemas/Upgrade' },
            },
            offlineEarned: { type: 'number', description: 'Monedas ganado offline' },
          },
        },
        ClickResponse: {
          type: 'object',
          properties: {
            coins: { type: 'number', description: 'Monedas después del click' },
            clickPower: { type: 'number', description: 'Poder de click actual' },
            totalClicks: { type: 'number', description: 'Total de clicks' },
          },
        },
        UpgradeResponse: {
          type: 'object',
          properties: {
            upgradeId: { type: 'string', description: 'ID del upgrade' },
            newLevel: { type: 'number', description: 'Nuevo nivel' },
            newCost: { type: 'number', description: 'Nuevo costo' },
            newMultiplier: { type: 'number', description: 'Nuevo multiplicador' },
            clickPower: { type: 'number', description: 'Click power actualizado' },
            passiveIncome: { type: 'number', description: 'Ingreso pasivo actualizado' },
          },
        },
        SaveResponse: {
          type: 'object',
          properties: {
            savedAt: { type: 'number', description: 'Timestamp del guardado' },
            coins: { type: 'number', description: 'Monedas guardadas' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Si la operación fue exitosa' },
            data: { type: 'object', description: 'Datos de respuesta' },
            error: { type: 'string', description: 'Mensaje de error' },
          },
        },
        // Multiplayer Schemas
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID único de la sala' },
            name: { type: 'string', description: 'Nombre de la sala' },
            playerCount: { type: 'number', description: 'Cantidad de jugadores' },
            maxPlayers: { type: 'number', description: 'Máximo de jugadores' },
            shopCount: { type: 'number', description: 'Cantidad de tiendas' },
          },
        },
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID del jugador' },
            name: { type: 'string', description: 'Nombre del jugador' },
            coins: { type: 'number', description: 'Monedas del jugador' },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID de la tienda' },
            name: { type: 'string', description: 'Nombre de la tienda' },
            ownerId: { type: 'string', description: 'ID del owner' },
            itemCount: { type: 'number', description: 'Cantidad de items' },
          },
        },
        ShopItem: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID del item' },
            name: { type: 'string', description: 'Nombre del item' },
            description: { type: 'string', description: 'Descripción' },
            price: { type: 'number', description: 'Precio en monedas' },
            currentStock: { type: 'number', description: 'Stock actual' },
            maxStock: { type: 'number', description: 'Stock máximo' },
            expiresIn: { type: 'number', description: 'Tiempo restante en ms' },
          },
        },
        Inventory: {
          type: 'object',
          properties: {
            coins: { type: 'number', description: 'Monedas' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  quantity: { type: 'number' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Código de error' },
            message: { type: 'string', description: 'Mensaje de error' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Solicitud incorrecta',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' },
              example: { success: false, error: 'Player ID is required' },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' },
              example: { success: false, error: 'Upgrade not found' },
            },
          },
        },
      },
    },
    paths: {
      '/api/game/{playerId}': {
        get: {
          summary: 'Obtener estado del juego',
          description: 'Retorna el estado actual del jugador, incluyendo progreso offline',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          responses: {
            200: {
              description: 'Estado del juego',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/game/{playerId}/click': {
        post: {
          summary: 'Registrar click',
          description: 'Procesa un click y añade monedas basadas en clickPower',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          responses: {
            200: {
              description: 'Resultado del click',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/game/{playerId}/sync': {
        get: {
          summary: 'Sincronización rápida',
          description: 'Obtiene datos de sincronización del jugador (más ligero que getGameState)',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          responses: {
            200: {
              description: 'Datos de sincronización',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/game/{playerId}/upgrades': {
        get: {
          summary: 'Obtener upgrades',
          description: 'Retorna la lista de upgrades disponibles del jugador',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          responses: {
            200: {
              description: 'Lista de upgrades',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/game/{playerId}/upgrade': {
        post: {
          summary: 'Comprar upgrade',
          description: 'Compra un upgrade para mejorar clickPower o passiveIncome',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    upgradeId: {
                      type: 'string',
                      enum: ['click_1', 'click_2', 'click_3', 'passive_1', 'passive_2', 'passive_3'],
                      description: 'ID del upgrade a comprar',
                    },
                  },
                  required: ['upgradeId'],
                },
                example: { upgradeId: 'click_1' },
              },
            },
          },
          responses: {
            200: {
              description: 'Upgrade comprado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
      '/api/game/{playerId}/save': {
        post: {
          summary: 'Guardar estado',
          description: 'Guarda el estado completo del juego',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID único del jugador',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GameState' },
              },
            },
          },
          responses: {
            200: {
              description: 'Estado guardado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
          },
        },
      },
    },
  },
  apis: ['./src/index.ts'],
};
