# Arquitectura del Juego

## Visión General

El proyecto está dividido en dos partes:

```
Laboratorio_IA/
├── cliker-ia/          # Cliente - Frontend (React + Phaser)
├── server-cliker-ia/  # Servidor - Backend (Express + Socket.io)
└── qa/                # Pruebas automatizadas (Playwright)
```

---

## Frontend (cliker-ia)

### Stack
- **React 18** - Interfaz de usuario
- **Phaser 3** - Motor de juegos 2D
- **TypeScript** - Tipado estático
- **Vite** - Build tool

### Estructura
```
cliker-ia/
├── src/
│   ├── components/     # Componentes React
│   ├── scenes/        # Escenas de Phaser
│   ├── systems/       # Sistemas del juego
│   ├── hooks/         # Custom hooks
│   └── types/         # Tipos TypeScript
```

---

## Backend (server-cliker-ia)

### Stack
- **Express** - Servidor HTTP
- **Socket.io** - Comunicación en tiempo real
- **TypeScript** - Tipado estático
- **Vitest** - Testing

### Endpoints
- `GET /api/health` - Health check
- WebSocket: Comunicación en tiempo real para el juego

---

## Testing (qa)

### Stack
- **Playwright** - E2E testing
- **Visuales** - Screenshots y videos de fallos

---

## Comunicación

El cliente se conecta al servidor via WebSocket para:
- Sincronización de estado
- Guardado de progreso
- (Futuro) Modo multijugador
