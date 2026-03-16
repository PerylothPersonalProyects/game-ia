# Historias de Usuario - Frontend
# Idle Clicker Game

---

## HU-FE-001: Panel de Display de Coins

**Como** desarrollador frontend,
**Quiero** un componente que muestre la cantidad actual de coins del jugador,
**Para** que el jugador pueda ver su balance en todo momento.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  🪙 15,250                              │
│     ▲ +125/s                            │
└─────────────────────────────────────────┘
```

- Panel superior con icono de moneda
- Cantidad formateada con separadores de miles (15,250)
- Indicador visual de generación pasiva (+X/s)
- Sincronización en tiempo real con el estado del juego

### Criterios de Aceptación
- [ ] Mostrar el total de coins con formato legible (Intl.NumberFormat)
- [ ] Actualizar automáticamente cuando el jugador hace click o recibe coins pasivos
- [ ] Animación de "subida" cuando los coins aumentan (tween de escala)
- [ ] Indicador de CPS visible junto al contador de coins
- [ ] Icono de moneda visible junto a la cantidad

---

## HU-FE-002: Stats Panel (CPC, CPS)

**Como** desarrollador frontend,
**Quiero** un panel que muestre las estadísticas del jugador (CPC y CPS),
**Para** que el jugador pueda planificar sus compras.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  CLICK: 15 🖱️   │  AUTO: 250 ⚡/s      │
└─────────────────────────────────────────┘
```

- Panel de estadísticas en la zona superior
- CPC (Coins Per Click) con icono de mouse
- CPS (Coins Per Second) con icono de rayo
- Valores actualizados en tiempo real tras compras

### Criterios de Aceptación
- [ ] Mostrar CPC con formato legible y etiqueta "/ click"
- [ ] Mostrar CPS con formato legible y etiqueta "/ seg"
- [ ] Actualizar inmediatamente al comprar un upgrade
- [ ] Usar colores diferenciados para CPC (azul) y CPS (amarillo)
- [ ] Posicionar de forma visible pero no intrusiva

---

## HU-FE-003: Botón Principal de Click

**Como** desarrollador frontend,
**Quiero** un área de click interactiva en el centro de la pantalla,
**Para** que el jugador pueda generar coins activamente.

### Componente/UI
```
              ┌─────────┐
              │   🪙    │
              │ CLICK!  │
              └─────────┘
```

- Área de click central/principal
- Efecto visual al hover (escala, brillo)
- Efecto al click (press, bounce)
- Integración con Phaser para el área de juego

### Criterios de Aceptación
- [ ] El área de click es visible y claramente identificable
- [ ] Al hacer click, se genera la cantidad de coins según el CPC actual
- [ ] Feedback visual inmediato al hacer click (escala, color)
- [ ] Sonido de click reproducido al interactuar
- [ ] Animación de partículas/efecto al hacer click
- [ ] Soporte para clicks rápidos sin límite de tasa

---

## HU-FE-004: Grid de 4 Upgrade Cards

**Como** desarrollador frontend,
**Quiero** un grid que muestre 4 upgrades disponibles para comprar,
**Para** que el jugador pueda ver y comparar sus opciones.

### Componente/UI
```
┌─────────────────────────────────────────────────────────┐
│  SHOP - Mejoras disponibles                            │
├───────────────┬───────────────┬───────────────┬───────┤
│  🟡 Dedo      │  ⚪ Cursor    │  🟢 Abuela    │       │
│  Flojo        │  Mágico       │  Cocinera     │
│  Lvl: 5       │  Lvl: 0       │  Lvl: 2       │
│  +3/click     │  +1/click    │  +5/seg       │
│  💰 45        │  💰 100      │  💰 250       │
└───────────────┴───────────────┴───────────────┴───────┘
```

- Grid de 2x2 (desktop) o 1x4 (mobile)
- 4 slots de upgrade visibles
- Indicador de tier con código de color
- Scroll o navegación si hay más upgrades

### Criterios de Aceptación
- [ ] Mostrar 4 upgrades simultáneamente
- [ ] Cada card muestra: nombre, nivel, efecto, costo
- [ ] Indicador visual de tier (T1-T10 con colores)
- [ ] Diferenciar upgrades de tipo click vs passive
- [ ] Layout responsivo (2x2 desktop, 1x4 mobile)
- [ ] Actualizar estado de cada card tras compras

---

## HU-FE-005: Card Individual de Upgrade

**Como** desarrollador frontend,
**Quiero** una card que muestre toda la información de un upgrade,
**Para** que el jugador pueda tomar decisiones de compra informadas.

### Componente/UI
```
┌──────────────────────────┐
│ 🟡 T1                   │
│ ═══════════════════     │
│ Dedo Flojo              │
│ +3 / click              │
│                         │
│ Nivel: 5  →  Nivel: 6  │
│ 🪙 45 coins              │
└──────────────────────────┘
```

- Información completa del upgrade
- Tier badge con color
- Nombre y descripción
- Efecto actual y próximo nivel
- Costo de compra

### Criterios de Aceptación
- [ ] Mostrar nombre del upgrade
- [ ] Mostrar tier con badge de color
- [ ] Mostrar nivel actual y siguiente
- [ ] Mostrar efecto (bonus por click/seg)
- [ ] Mostrar costo de compra
- [ ] Icono区分ador de tipo (click/passive)

---

## HU-FE-006: Estados de Upgrade (Comprable, No Funds, Max)

**Como** desarrollador frontend,
**Quiero** que las cards de upgrade muestren diferentes estados visuales,
**Para** que el jugador entienda cuándo puede o no comprar.

### Componente/UI
```
Normal:              No Funds:           Max Level:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 🟡 Dedo      │    │ 🔴 Dedo     │    │ 🟢 Dedo     │
│ Flojo        │    │ Flojo       │    │ Flojo       │
│ 💰 45        │    │ 💰 45       │    │ MAX         │
│ [COMPRAR]    │    │ [LOCKED]    │    │ (no puede)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

- Estado normal (comprable)
- Estado sin funds (no hay suficientes coins)
- Estado max (nivel máximo alcanzado)
- Estados deshabilitados con estilos visuales

### Criterios de Aceptación
- [ ] Estado NORMAL: borde estándar, botón habilitado
- [ ] Estado NO_FUNDS: borde rojo, botón deshabilitado, reduced opacity
- [ ] Estado MAX: badge "MAX", botón deshabilitado, efecto especial
- [ ] Transiciones suaves entre estados
- [ ] Tooltip con razón por qué no se puede comprar
- [ ] Animación de "shake" al intentar comprar sin funds

---

## HU-FE-007: Animación de Particles al Clickear

**Como** desarrollador frontend,
**Quiero** un sistema de partículas que se active al hacer click,
**Para** proporcionar feedback visual satisfactorio.

### Componente/UI
```
              ✦
           ✦  🪙  ✦
              ✦
```

- Partículas de moneda/estrellas al hacer click
- Dirección aleatoria hacia arriba
- Desvanecimiento progresivo
- Configurable en Constants.js

### Criterios de Aceptación
- [ ] Partículas aparecen en la posición del click
- [ ] Movimiento hacia arriba con dispersión lateral
- [ ] Desvanecimiento (alpha fade) progresivo
- [ ] Duración total de ~500ms
- [ ] Cantidad de partículas configurable (12-20)
- [ ] Rendimiento optimizado (no crear objetos en cada frame)
- [ ] Color de partículas alineado con la paleta del juego

---

## HU-FE-008: Popup de Números Flotantes

**Como** desarrollador frontend,
**Quiero** que los números de coins ganado aparezcan y floten,
**Para** que el jugador vea exactamente cuánto ganó por su acción.

### Componente/UI
```
          +15
           ↑
         +125          +8
                    ↑
```

- Número flotante aparece en posición del click
- Animación de subir y desvanecerse
- Color dorado para visibilidad
- Tamaño legible (16-24px)

### Criterios de Aceptación
- [ ] Mostrar "+X" donde X es la cantidad ganada
- [ ] Posición inicial en el lugar del click
- [ ] Animación de flotar hacia arriba (tween Y)
- [ ] Desvanecimiento progresivo (alpha 1 → 0)
- [ ] Duración total de ~800ms
- [ ] Tamaño de fuente legible (mínimo 16px)
- [ ] Color contrastante sobre cualquier fondo

---

## HU-FE-009: Animación de Compra Exitosa/Fallida

**Como** desarrollador frontend,
**Quiero** feedback visual claro al comprar un upgrade,
**Para** que el jugador confirme que su acción fue exitosa o fallida.

### Componente/UI
```
Compra Exitosa:          Compra Fallida:
┌──────────────────┐    ┌──────────────────┐
│ ✓ +3/click       │    │ ✗ Sin funds     │
│ [flash verde]    │    │ [shake] [rojo]  │
└──────────────────┘    └──────────────────┘
```

- Éxito: flash verde, checkmark, vibración sutil
- Fallo: shake horizontal, flash rojo, texto de error

### Criterios de Aceptación
- [ ] ÉXITO: Flash de color verde en la card
- [ ] ÉXITO: Animación de checkmark o "OK"
- [ ] ÉXITO: Actualización inmediata del nivel
- [ ] FALLO: Shake horizontal de la card
- [ ] FALLO: Color de borde rojo temporal
- [ ] FALLO: Texto "Sin funds" o similar
- [ ] Ambos: Sonido correspondiente (si está habilitado)

---

## HU-FE-010: Pantalla de Juego Principal

**Como** desarrollador frontend,
**Quiero** la pantalla principal donde se desarrolla el juego,
**Para** que el jugador pueda jugar inmediatamente.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  🪙 15,250         ⚡ CPC:15 CPS:250    │
├─────────────────────────────────────────┤
│                                         │
│              ┌─────────┐               │
│              │   🪙    │               │
│              │ CLICK!  │               │
│              └─────────┘               │
│                                         │
├─────────────────────────────────────────┤
│  🟡 🟢 ⚪ ⚪                            │
│  [Grid de Upgrades]                    │
└─────────────────────────────────────────┘
```

- Header con coins y stats
- Área central de click
- Shop/grid de upgrades
- Layout responsivo

### Criterios de Aceptación
- [ ] Todos los elementos principales visibles
- [ ] Layout estructurado y limpio
- [ ] Zona de click prominente y accesible
- [ ] Panel de stats siempre visible
- [ ] Shop accesible sin scroll en desktop
- [ ] Responsive para diferentes tamaños de pantalla
- [ ] Zona segura respetada (sin UI en zona crítica)

---

## HU-FE-011: Menú de Opciones

**Como** desarrollador frontend,
**Quiero** un menú de opciones accesible desde el juego,
**Para** que el jugador pueda ajustar configuraciones.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  ⚙️ OPCIONES                 [X]        │
├─────────────────────────────────────────┤
│                                         │
│  🔊 Volumen General    [████░░] 80%   │
│  🎵 Música             [█████░] 100%   │
│  🔔 SFX                [████░░] 75%    │
│                                         │
│  🌙 Modo Oscuro        [  ON  ]        │
│  📊 Estadísticas       [VER]            │
│  ❓ Ayuda               [VER]           │
│                                         │
│  [🔄 REINICIAR]                         │
└─────────────────────────────────────────┘
```

- Modal o panel lateral
- Controles de volumen
- Toggle de modo oscuro
- Botón de reinicio

### Criterios de Aceptación
- [ ] Accesible desde el juego principal (botón汉堡/menu)
- [ ] Control de volumen general
- [ ] Control de volumen de música
- [ ] Control de volumen de SFX
- [ ] Botón de mute global
- [ ] Botón de reinicio con confirmación
- [ ] Animación de apertura/cierre

---

## HU-FE-012: Pantalla de Game Over / Reset

**Como** desarrollador frontend,
**Quiero** una pantalla que confirme el reinicio del juego,
**Para** que el jugador no reinicie por accidente.

### Componente/UI
```
┌─────────────────────────────────────────┐
│                                         │
│         ⚠️ REINICIAR?                  │
│                                         │
│   ¿Estás seguro de que quieres         │
│   borrar todo tu progreso?             │
│                                         │
│   🪙 Coins: 15,250                     │
│   📈 CPS: 250                          │
│   🏆 Logros: 5/10                      │
│                                         │
│   [❌ CANCELAR]    [🗑️ REINICIAR]      │
│                                         │
└─────────────────────────────────────────┘
```

- Modal de confirmación
- Resumen del progreso actual
- Botones de acción clara

### Criterios de Aceptación
- [ ] Mostrar advertencia clara
- [ ] Mostrar resumen del progreso actual
- [ ] Botón CANCELAR destacado (no destructivo)
- [ ] Botón REINICIAR con estilo de peligro
- [ ] Requiere confirmación explícita
- [ ] Cerrar al presionar Escape o click fuera
- [ ] Animación de apertura

---

## HU-FE-013: Sincronizar Estado con WebSocket

**Como** desarrollador frontend,
**Quiero** que el estado del juego se sincronice con el servidor,
**Para** mantener persistencia y consistencia de datos.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  Sincronizando... ████░░░░░░ 60%      │
└─────────────────────────────────────────┘
```

- Sincronización en tiempo real
- Eventos de WebSocket
- Retry automático en caso de fallo

### Criterios de Aceptación
- [ ] Conectar con servidor WebSocket al iniciar
- [ ] Enviar eventos de compra al servidor
- [ ] Recibir confirmación antes de actualizar UI
- [ ] Reintentar automáticamente si falla
- [ ] Manejar race conditions de compras
- [ ] Actualizar estado local tras confirmación del servidor
- [ ] Usardebounce para evitar spam de mensajes

---

## HU-FE-014: Mostrar Estado de Conexión

**Como** desarrollador frontend,
**Quiero** ver el estado de la conexión con el servidor,
**Para** saber si mi progreso se está guardando.

### Componente/UI
```
Estados:
🟢 Conectado     🔵 Sincronizando    🟠 Reconectando    🔴 Desconectado

Indicador en UI:
┌─────────────────────────────────────────┐
│  🪙 15,250         🟢 Sincronizado    │
└─────────────────────────────────────────┘
```

- Indicador visual de estado
- Colores para cada estado
- Mensaje de estado

### Criterios de Aceptación
- [ ] Mostrar indicador de conexión en UI
- [ ] Verde cuando conectado y sincronizado
- [ ] Amarillo/naranja cuando reconectando
- [ ] Rojo cuando desconectado
- [ ] Mostrar "Sincronizando..." durante operaciones
- [ ] Posición no intrusiva (esquina)
- [ ] Animación de transición entre estados

---

## HU-FE-015: Loading States

**Como** desarrollador frontend,
**Quiero** indicadores de carga mientras se procesan operaciones,
**Para** que el jugador sepa que el juego está respondiendo.

### Componente/UI
```
Carga Inicial:          Saving:             Comprando:
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  ████████░░  │     │  Guardando... │     │  Procesando  │
│  80%         │     │  ⏳           │     │  ⏳          │
└──────────────┘      └──────────────┘     └──────────────┘
```

- Pantalla de carga inicial
- Indicador al guardar
- Spinner al comprar
- Skeleton loading para datos

### Criterios de Aceptación
- [ ] Pantalla de carga con progress bar al iniciar
- [ ] Spinner durante guardado
- [ ] Loading state al cargar datos del servidor
- [ ] Skeleton UI para contenido que carga
- [ ] No bloquear interacción innecesariamente
- [ ] Mensajes claros de lo que está ocurriendo
- [ ] Animación fluida

---

## HU-FE-016: Panel de Logros

**Como** desarrollador frontend,
**Quiero** un panel donde ver los logros obtenidos y disponibles,
**Para** motivarme con objetivos y reconocer mi progreso.

### Componente/UI
```
┌─────────────────────────────────────────┐
│  🏆 LOGROS                    [X]     │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Primer Click              🎯       │
│     ¡Hiciste tu primer click!           │
│                                         │
│  ✅ Primera Compra           🛒️        │
│     Compraste tu primer upgrade         │
│                                         │
│  🔒 Mil Coins                 💰       │
│     Llega a 1,000 coins                 │
│     ████████░░░░ 800/1000               │
│                                         │
│  🔒 Millón Coins              💎       │
│     Llega a 1,000,000 coins             │
│     ██░░░░░░░░░░ 20,000/1M              │
└─────────────────────────────────────────┘
```

- Lista de logros
- Estado obtenido/bloqueado
- Progreso hacia el logro
- Notificaciones al obtener

### Criterios de Aceptación
- [ ] Mostrar todos los logros definidos
- [ ] Indicador visual de logros obtenidos
- [ ] Progress bar para logros en progreso
- [ ] Notificación al obtener un logro
- [ ] Persistir logros obtenidos
- [ ] Diseño de card por logro
- [ ] Scroll si hay muchos logros

---

## HU-FE-017: Sistema de Recompensas Diarias

**Como** desarrollador frontend,
**Quiero** recibir una bonificación por conectarme cada día,
**Para** incentivarme a jugar regularmente.

### Componente/UI
```
Notificación de recompensa:
┌─────────────────────────────────────────┐
│  🎁 RECOMPENSA DIARIA!                 │
│     Día 3 de racha                      │
│     +400 🪙                            │
│           [RECLAMAR]                    │
└─────────────────────────────────────────┘

UI en header:
┌─────────────────────────────────────────┐
│  🪙 15,250    📅 3 días    ⏰ 4:32:15  │
└─────────────────────────────────────────┘
```

- Modal de recompensa al conectar
- Contador de días consecutivos
- Temporizador hasta próxima recompensa

### Criterios de Aceptación
- [ ] Verificar si es un nuevo día al conectar
- [ ] Mostrar modal de recompensa si aplica
- [ ] Calcular recompensa según racha (100→200→400→800→1600)
- [ ] Mostrar contador de tiempo hasta próxima recompensa
- [ ] Animación especial al recibir recompensa
- [ ] Persistir streak de días
- [ ] Resetear streak si se pierde un día

---

## HU-FE-018: Control de Volumen/Mute

**Como** desarrollador frontend,
**Quiero** controlar el volumen del juego,
**Para** ajustar la experiencia de audio a mis preferencias.

### Componente/UI
```
Volumen General:    Música:           SFX:
[████░░] 80%      [█████░] 100%     [███░░░] 60%

Mute:
[🔊] or [🔇]
```

- Slider de volumen general
- Slider de volumen de música
- Slider de volumen de SFX
- Botón de mute

### Criterios de Aceptación
- [ ] Control de volumen general (0-100%)
- [ ] Control de volumen de música separado
- [ ] Control de volumen de SFX separado
- [ ] Botón de mute que silencie todo
- [ ] Persistir configuración de volumen
- [ ] Icono cambia según estado mute
- [ ] Sonido de prueba al ajustar slider (opcional)

---

## HU-FE-019: Layout para Desktop

**Como** desarrollador frontend,
**Quiero** un layout optimizado para pantallas de escritorio,
**Para** que el juego se vea y funcione bien en desktop.

### Layout Desktop
```
┌─────────────────────────────────────────────────────────┐
│  🪙 15,250        CPC:15 / click   CPS:250 / seg  🟢  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ┌─────────────┐                      │
│                    │             │                      │
│                    │    🪙       │    Panel de         │
│                    │   CLICK!    │    Info Adicional   │
│                    │             │    (opcional)       │
│                    └─────────────┘                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  SHOP                                                   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐ │
│  │ Upgrade 1 │ │ Upgrade 2 │ │ Upgrade 3 │ │ Upg 4   │ │
│  └───────────┘ └───────────┘ └───────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

- Resolución recomendada: 1200x800 mínimo
- Grid 2x2 para upgrades
- Panel lateral opcional para info
- Espaciado generoso

### Criterios de Aceptación
- [ ] Resolución mínima 1024x768 soportada
- [ ] Grid de upgrades 2x2
- [ ] Zona de click prominente
- [ ] Stats siempre visibles
- [ ] Menos scroll posible
- [ ] Botones de tamaño clickeable (min 44px)
- [ ] Tooltips en elementos interactivos

---

## HU-FE-020: Layout para Mobile

**Como** desarrollador frontend,
**Quiero** un layout optimizado para dispositivos móviles,
**Para** que el juego sea jugable en teléfono.

### Layout Mobile
```
┌─────────────────────┐
│ 🪙15,250  🟢  📅3  │
├─────────────────────┤
│                     │
│      ┌─────┐        │
│      │ 🪙  │        │
│      │CLICK│        │
│      └─────┘        │
│                     │
├─────────────────────┤
│ SHOP                │
│ ┌─────────────┐     │
│ │ Upgrade 1   │     │
│ ├─────────────┤     │
│ │ Upgrade 2   │     │
│ ├─────────────┤     │
│ │ Upgrade 3   │     │
│ ├─────────────┤     │
│ │ Upgrade 4   │     │
│ └─────────────┘     │
└─────────────────────┘
```

- Layout vertical
- Grid 1x4 para upgrades
- Touch optimizado
- Viewport meta tag

### Criterios de Aceptación
- [ ] Viewport meta tag configurado
- [ ] Grid de upgrades 1x4 (scrollable)
- [ ] Zona de click adaptada a touch
- [ ] Botones mínimos de 48px
- [ ] No hay elementos demasiado pequeños
- [ ] Orientación portrait optimizada
- [ ] Safe area respetada (notch, home bar)
- [ ] Touch events funcionan correctamente

---

## Dependencias entre HUs

| HU | Depende de |
|----|------------|
| HU-FE-002 | HU-FE-001 |
| HU-FE-003 | HU-FE-001, HU-FE-002 |
| HU-FE-004 | HU-FE-005, HU-FE-006 |
| HU-FE-005 | HU-FE-001, HU-FE-002 |
| HU-FE-006 | HU-FE-005 |
| HU-FE-007 | HU-FE-003 |
| HU-FE-008 | HU-FE-003 |
| HU-FE-009 | HU-FE-005, HU-FE-006 |
| HU-FE-010 | HU-FE-001, HU-FE-002, HU-FE-003, HU-FE-004 |
| HU-FE-011 | HU-FE-010 |
| HU-FE-012 | HU-FE-011 |
| HU-FE-013 | HU-FE-010 |
| HU-FE-014 | HU-FE-013 |
| HU-FE-015 | HU-FE-013 |
| HU-FE-016 | HU-FE-010 |
| HU-FE-017 | HU-FE-010, HU-FE-013 |
| HU-FE-018 | HU-FE-011 |
| HU-FE-019 | HU-FE-010 |
| HU-FE-020 | HU-FE-010 |

## Notas Técnicas

- React 18 + Phaser 3 integración via React Context
- Estado del juego sincronizado via WebSocket (Socket.io)
- Animaciones usando Phaser Tweens para elementos del juego
- UI de React para menús, shop, y overlays
- Responsive breakpoints: 768px (mobile), 1024px (tablet), 1200px+ (desktop)
- Constants centralizados en `Constants.js` para configuración visual
- EventBus para comunicación entre sistemas
