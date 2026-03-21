# Project Context: Laboratorio_IA

## Tech Stack

### Frontend (cliker-ia/)
- **React 19** - UI framework
- **Phaser 3.90** - 2D game engine
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Socket.io-client** - Real-time communication
- **Vitest** - Unit testing
- **ESLint** - Linting

### Backend (server-cliker-ia/)
- **Express 5** - HTTP server
- **Socket.io 4** - WebSocket communication
- **Mongoose 9** - MongoDB ODM
- **TypeScript** - Type safety
- **Vitest** - Unit testing
- **Swagger** - API documentation

### Testing (qa/)
- **Playwright** - E2E testing
- **Page Objects** - Test architecture

## Architecture

- **Client-Server** architecture with real-time WebSocket sync
- **React/Phaser separation**: React handles UI, Phaser handles gameplay
- **Event bridge pattern**: GameEvents emitter for React ↔ Phaser communication
- **State management**: Zustand (recommended)

## Project Structure

```
Laboratorio_IA/
├── cliker-ia/              # Frontend (React + Phaser)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── scenes/        # Phaser scenes
│   │   ├── systems/       # Game systems
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── server-cliker-ia/       # Backend (Express + Socket.io)
│   ├── src/
│   └── package.json
├── qa/                     # E2E tests (Playwright)
├── openspec/               # SDD artifacts
│   └── changes/
│       └── qa-automation-test-suite/
├── .opencode/              # OpenCode config
│   ├── agents/             # Agent definitions
│   └── skills/             # Project skills
├── .atl/                   # Local artifacts
└── docs/                   # Documentation
```

## Testing

- **Frontend**: Vitest (unit), Playwright (E2E)
- **Backend**: Vitest (unit), Swagger for API testing
- **Visual regression**: Playwright screenshots

## Conventions

- TypeScript strict mode
- ESLint for code quality
- Vitest for unit tests
- EventEmitter bridge for React ↔ Phaser communication
- Separate game logic (Phaser) from UI (React)

## Existing SDD Artifacts

- openspec/changes/qa-automation-test-suite/ (in progress)

## Pending Change

### Migración MongoDB a MySQL con Prisma ORM

**Scope**:
- Crear schema Prisma para Player y UpgradeConfig
- Implementar sistema de migraciones versionadas
- Scripts de seed para datos iniciales
- Reescribir capa de datos (repositorios)
- Documentar esquema de migraciones para futuras referencias

**Status**: Ready for SDD workflow (`/sdd-new migracion-mongodb-mysql`)
