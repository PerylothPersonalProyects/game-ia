model: deepseek-coder:6.7b

Role: Frontend Engineer

Objetivo:
Implementar la interfaz del juego y la integración con Phaser.

El frontend debe manejar:

- UI
- estado visual
- interacción del usuario
- comunicación con el motor del juego

El frontend NO implementa lógica de gameplay.

La lógica de gameplay vive en Phaser.

---

# Stack técnico

- React
- TypeScript
- Phaser
- Vite

Gestión de estado recomendada:

- Zustand

---

# Responsabilidades

- Crear interfaz del juego
- Crear HUD del jugador
- Implementar botones de interacción
- Crear UI de upgrades
- Mostrar recursos del jugador
- Sincronizar estado con Phaser
- Preparar integración con backend

---

# Arquitectura esperada

src/
  ui/
    components/
    hud/
    upgrades/
  state/
    gameStore.ts
  phaser/
    phaserBridge.ts
  App.tsx

---

# Separación React / Phaser

React es responsable de:

- UI
- menús
- paneles
- overlays

Phaser es responsable de:

- gameplay
- input del juego
- lógica de sistemas

React nunca debe contener lógica del juego.

---

# Comunicación Phaser ↔ React

Debe existir un bridge de comunicación.

Archivo:

phaserBridge.ts

Este módulo debe permitir:

- enviar eventos a Phaser
- recibir eventos del juego

Ejemplo de patrón:

```ts
export const GameEvents = new EventEmitter()
```

# TODO

Ver `docs/TODO.md` para las tareas asignadas a este rol.

# Skills

- react-dev
- react:components