# Proposal: qa-automation-test-suite

## Intent

Establecer una suite de pruebas automatizadas completa para el proyecto Idle Clicker Game, dividiendo en dos proyectos: pruebas de Frontend (Playwright) y pruebas de Backend (Karate).

## Scope

### In Scope
1. **Frontend Tests (qa/)** - Ampliar proyecto existente con Playwright
   - Tests E2E de jugabilidad (click, upgrades, generación pasiva)
   - Tests de regresión visual
   - Tests de rendimiento
   - Configuración mejorada con page objects y fixtures

2. **Backend Tests (karate/)** - Nuevo proyecto
   - Tests de API REST (GET/POST endpoints)
   - Tests de WebSocket (conexiones, eventos)
   - Tests de integración con base de datos
   - Data-driven tests desde JSON/CSV

### Out of Scope
- Tests de rendimiento de carga (stress testing)
- Tests de seguridad (penetration testing)
- Integración con CI/CD (GitHub Actions)

## Approach

1. **Frontend (Playwright)**:
   - Expandir configuración existente en qa/
   - Implementar Page Object Model
   - Agregar fixtures para estados de juego
   - Configurar screenshot/video en fallos

2. **Backend (Karate)**:
   - Crear nuevo proyecto karate/ en raíz
   - Configurar karate.config.js
   - Crear features por endpoint
   - Usar api-spec.md como referencia

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| qa/ | Modified | Ampliar configuración y tests de Playwright |
| qa/playwright.config.ts | Modified | Mejorar configuración existente |
| qa/tests/game.spec.ts | Modified | Expandir casos de prueba |
| karate/ | New | Nuevo proyecto de Karate |
| docs/api-spec.md | Reference | Fuente de requisitos API |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Servidor backend no disponible | Medium | Usar mocks o iniciar servidor en tests |
| Tests flaky por timing | Medium | Implementar wait strategy apropiados |
| WebSocket testing complejo | High | Empezar con REST, luego WebSocket |

## Rollback Plan

1. Mantener backups de archivos modificados en qa/
2. Si karate/ no funciona, documentar como "en desarrollo"
3. Tests de frontend existentes ya funcionan (no romper backward compatibility)

## Dependencies

- Servidor backend corriendo en localhost:3000 (o configurar variable de entorno)
- node/npm instalado
- Puerto 3000 disponible

## Success Criteria

- [ ] Tests de frontend pasan en 3 navegadores (Chromium, Firefox, WebKit)
- [ ] Tests de backend (REST) cubren todos los endpoints de api-spec.md
- [ ] Tests de WebSocket cubren conexión y eventos principales
- [ ] Configuración permite ejecución local y en CI
- [ ] Reportes HTML generados automáticamente
