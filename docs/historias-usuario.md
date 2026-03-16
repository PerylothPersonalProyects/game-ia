# Historias de Usuario - Idle Clicker Game

---

## HU-001: Generación de Coins por Click

**Como** jugador,
**Quiero** hacer click en el área de juego para obtener coins,
**Para** generar la moneda principal del juego y comenzar mi progresión.

### Criterios de Aceptación
- [ ] Al hacer click en el área de juego, se generan coins según el valor de CPC actual
- [ ] Los coins generados se suman inmediatamente al total del jugador
- [ ] El CPC base inicial es de 1 coin por click
- [ ] Cada click produce feedback visual inmediato (animación/partícula)
- [ ] Se puede hacer click rápidamente sin límite de tasa

### Tareas Técnicas
- [ ] Implementar handler de click en Phaser scene
- [ ] Calcular coins generados usando fórmula: `coins = baseClick + (upgrades click sum)`
- [ ] Integrar con sistema de animación de coins

---

## HU-002: Visualización de Coins

**Como** jugador,
**Quiero** ver la cantidad actual de coins que poseo,
**Para** saber cuánto dinero tengo disponible para comprar upgrades.

### Criterios de Aceptación
- [ ] Se muestra el total de coins en la UI del juego
- [ ] Los coins se muestran con formato legible (separadores de miles, notación K/M/B para grandes cantidades)
- [ ] El contador de coins se actualiza en tiempo real tras cada click o generación pasiva
- [ ] La visualización es visible y accesible durante todo el juego
- [ ] Se muestra el icono de moneda junto a la cantidad

### Tareas Técnicas
- [ ] Crear componente React para mostrar coins
- [ ] Implementar formateo de números grandes (Intl.NumberFormat)
- [ ] Sincronizar estado de coins entre Phaser y React via contexto
- [ ] Optimizar re-renders usando useMemo/useCallback

---

## HU-003: Upgrade de Click

**Como** jugador,
**Quiero** comprar mejoras que aumenten los coins obtenidos por cada click,
**Para** maximizar la generación activa de coins.

### Criterios de Aceptación
- [ ] Los upgrades de tipo "click" aumentan el CPC (Coins Per Click)
- [ ] Al comprar un upgrade click, el CPC se incrementa según el efecto del upgrade
- [ ] El efecto es acumulativo: múltiplos upgrades click se suman
- [ ] Se muestra el nivel actual de cada upgrade click poseído
- [ ] La descripción del upgrade indica el bonus que proporciona

### Cálculo de CPC
```
CPC = 1 (base) + Σ(upgrade.effect * upgrade.level) para todos los upgrades de tipo click
```

### Tareas Técnicas
- [ ] Definir tipo de dato Upgrade con campo `type: 'click'`
- [ ] Implementar función de cálculo de CPC total
- [ ] Crear UI de upgrade click con nivel y efecto visible
- [ ] Integrar con el sistema de costo y compra

---

## HU-004: Generación Pasiva de Coins

**Como** jugador,
**Quiero** que los coins se generen automáticamente cada segundo,
**Para** obtener ingresos incluso cuando no estoy haciendo click activamente.

### Criterios de Aceptación
- [ ] El juego genera coins automáticamente cada 1 segundo
- [ ] La cantidad de coins generados por segundo equals CPS (Coins Per Second)
- [ ] El CPS inicial es 0 (sin generación pasiva al comenzar)
- [ ] Los coins pasivos se acumulan incluso mientras el jugador está inactivo
- [ ] Se puede cerrar el juego y al volver los coins pasivos se han acumulado

### Cálculo de CPS
```
CPS = Σ(upgrade.effect * upgrade.level) para todos los upgrades de tipo passive
```

### Tareas Técnicas
- [ ] Implementar timer/tick system en Phaser para generación pasiva
- [ ] Calcular CPS total desde upgrades passive
- [ ] Guardar timestamp de última conexión para calcular coins offline
- [ ] Mostrar indicador visual de generación pasiva activa

---

## HU-005: Upgrade Passive

**Como** jugador,
**Quiero** comprar mejoras que aumenten la generación automática de coins,
**Para** incrementar mi riqueza sin necesidad de clicks constantes.

### Criterios de Aceptación
- [ ] Los upgrades de tipo "passive" aumentan el CPS (Coins Per Second)
- [ ] Al comprar un upgrade passive, el CPS se incrementa según el efecto del upgrade
- [ ] Los efectos passive son acumulativos
- [ ] Se muestra el nivel actual y el CPS total en la UI
- [ ] Los upgrades passive aparecen diferenciados de los click en el shop

### Tareas Técnicas
- [ ] Definir tipo de dato Upgrade con campo `type: 'passive'`
- [ ] Implementar función de cálculo de CPS total
- [ ] Crear UI de upgrade passive con nivel y efecto visible
- [ ] Animar el incremento de coins pasivos en tiempo real

---

## HU-006: Cálculo de Costo de Upgrade

**Como** sistema,
**Quiero** calcular el costo de cada upgrade basado en su nivel actual,
**Para** implementar una progresión económica balanceada.

### Criterios de Aceptación
- [ ] Cada upgrade tiene un costo base definido en su configuración
- [ ] Cada upgrade tiene un multiplicador de costo (costMultiplier)
- [ ] El costo aumenta exponencialmente con cada nivel comprado
- [ ] La fórmula de costo es: `costo = costoBase * (multiplicador ^ nivel)`
- [ ] El costo se muestra correctamente en la UI antes de comprar
- [ ] El jugador no puede comprar si no tiene suficientes coins

### Ejemplo de Cálculo
| Upgrade | Base | Multiplier | Nivel | Costo |
|---------|------|------------|-------|-------|
| Dedo Flojo | 10 | 1.15 | 0 | 10 |
| Dedo Flojo | 10 | 1.15 | 1 | 10 * 1.15^1 = 11.5 |
| Dedo Flojo | 10 | 1.15 | 10 | 10 * 1.15^10 ≈ 40.45 |

### Tareas Técnicas
- [ ] Implementar función `calculateUpgradeCost(baseCost, multiplier, level)`
- [ ] Redondear costos a números enteros para mejor UX
- [ ] Validar que el jugador tiene suficientes coins antes de permitir compra

---

## HU-007: Sistema de Shop

**Como** jugador,
**Quiero** ver una lista de upgrades disponibles para comprar,
**Para** decidir qué mejoras adquirir con mis coins.

### Criterios de Aceptación
- [ ] El shop muestra 4 upgrades visibles simultáneamente
- [ ] Cada card de upgrade muestra: nombre, descripción, costo, nivel actual, efecto
- [ ] Los upgrades se agrupan por tier (T1-T10) según su rareza
- [ ] Los upgrades deshabilitados (sin coins suficientes) se muestran con estado visual diferente
- [ ] Se indica claramente si el upgrade es de tipo click o passive (icono/texto)
- [ ] El tier del upgrade es visible para que el jugador identifique la rareza

### Estructura del Shop
- [ ] Header con título "Shop" o "Mejoras"
- [ ] Grid de 4 cards de upgrades
- [ ] Cada card muestra información completa del upgrade
- [ ] Los tiers superiores tienen mejor эффект pero mayor costo

### Tareas Técnicas
- [ ] Crear componente React Shop y UpgradeCard
- [ ] Definir estructura de datos para mostrar upgrades en shop
- [ ] Implementar lógica de filtrado por tier desbloqueado
- [ ] Diseñar layout responsivo para el shop

---

## HU-008: Compra de Upgrade

**Como** jugador,
**Quiero** comprar un upgrade del shop,
**Para** mejorar mis estadísticas de generación de coins.

### Criterios de Aceptación
- [ ] Al hacer click en un upgrade, se intenta comprar
- [ ] Si el jugador tiene suficientes coins, se deduce el costo del total
- [ ] El nivel del upgrade aumenta en 1 tras la compra
- [ ] Las estadísticas (CPC o CPS) se actualizan inmediatamente
- [ ] Se muestra feedback visual de compra exitosa (animación, sonido)
- [ ] Si no hay suficientes coins, se muestra feedback de error (shake, color rojo)

### Flujo de Compra
1. Jugador hace click en upgrade
2. Sistema verifica coins suficientes
3. Si OK:deducir costo, incrementar nivel, actualizar estadísticas
4. Si FAIL:mostrar error visual

### Tareas Técnicas
- [ ] Implementar función `purchaseUpgrade(upgradeId)`
- [ ] Validar coins suficientes antes de compra
- [ ] Actualizar estado del upgrade (nivel)
- [ ] Recalcular CPC/CPS tras compra
- [ ] Reproducir sonido de compra
- [ ] Emitir evento de compra para estadísticas

---

## HU-009: Reemplazo de Upgrade en Shop

**Como** sistema,
**Quiero** reemplazar un upgrade comprado del shop por uno nuevo,
**Para** mantener siempre 4 opciones disponibles y variedad en el juego.

### Criterios de Aceptación
- [ ] Al comprar un upgrade, ese slot del shop se filled con un nuevo upgrade
- [ ] El nuevo upgrade puede ser de cualquier tier igual o inferior al tier desbloqueado actual
- [ ] No aparecen upgrades repetidos en el shop (mismo ID)
- [ ] El tier del nuevo upgrade puede variar para dar variedad
- [ ] El reemplazo es instantáneo tras la compra

### Lógica de Selección de Nuevo Upgrade
- [ ] Seleccionar aleatoriamente de upgrades disponibles del tier actual
- [ ] Priorizar tiers que el jugador aún no tiene muchos upgrades
- [ ] Evitar dar siempre los mismos upgrades

### Tareas Técnicas
- [ ] Implementar función `getRandomUpgrade()` 
- [ ] Mantener pool de upgrades disponibles
- [ ] Filtrar upgrades ya comprados al máximo nivel
- [ ] Integrar con el sistema de tier unlock

---

## HU-010: Nivel Máximo de Upgrade

**Como** sistema,
**Quiero** limitar el nivel de cada upgrade a su máximo definido,
**Para** evitar progresión infinita y mantener balance del juego.

### Criterios de Aceptación
- [ ] Cada upgrade tiene un `maxLevel` definido en su configuración
- [ ] Al llegar al maxLevel, el upgrade no se puede comprar más
- [ ] El shop muestra visualmente que el upgrade está al máximo (badge, texto)
- [ ] El upgrade al máximo puede seguir apareciendo en el shop pero marcado como "MAX"
- [ ] El costo no se muestra para upgrades al máximo
- [ ] El jugador no puede comprar si no tiene coins suficientes

### Ejemplo de MaxLevel por Tier
| Tier | MaxLevel Típico |
|------|-----------------|
| T1 | 100 |
| T2 | 50-75 |
| T3 | 25-40 |
| T4-T6 | 2-20 |
| T7-T10 | 1-2 |

### Tareas Técnicas
- [ ] Añadir campo `maxLevel` a la definición de upgrades
- [ ] Verificar nivel < maxLevel antes de permitir compra
- [ ] Mostrar estado visual de upgrade al máximo
- [ ] En HU-009, filtrar upgrades al máximo del pool de selección

---

## HU-011: Estadísticas del Jugador

**Como** jugador,
**Quiero** ver mis estadísticas actuales (CPC y CPS),
**Para** entender mi poder de generación de coins y planificar compras.

### Criterios de Aceptación
- [ ] Se muestra el CPC (Coins Per Click) actual en la UI
- [ ] Se muestra el CPS (Coins Per Second) actual en la UI
- [ ] Las estadísticas se actualizan en tiempo real tras comprar upgrades
- [ ] Las estadísticas son visibles en todo momento (dashboard/header)
- [ ] Se indica claramente si el valor es por click o por segundo

### Formato de Visualización
```
CPC: 15 / click
CPS: 250 / seg
```

### Tareas Técnicas
- [ ] Crear componente StatsPanel
- [ ] Calcular CPC = 1 + sum(click upgrades effects * levels)
- [ ] Calcular CPS = sum(passive upgrades effects * levels)
- [ ] Actualizar stats en cada compra de upgrade

---

## HU-012: Progresión por Tier

**Como** jugador,
**Quiero** que los tiers de upgrades se desbloqueen progresivamente,
**Para** tener una curva de dificultad y sensación de progreso.

### Criterios de Aceptación
- [ ] Al comenzar el juego, solo están disponibles upgrades T1
- [ ] Los tiers T2-T10 se desbloquean automáticamente según el CPS del jugador
- [ ] Cada tier tiene un umbral de CPS para desbloquearse
- [ ] Se notifica al jugador cuando un nuevo tier se desbloquea
- [ ] Los upgrades de tiers superiores no aparecen hasta estar desbloqueados

### Tabla de Desbloqueo de Tiers
| Tier | CPS Requerido |
|------|---------------|
| T1 | 0 (inicio) |
| T2 | 10 |
| T3 | 100 |
| T4 | 1,000 |
| T5 | 10,000 |
| T6 | 100,000 |
| T7 | 1,000,000 |
| T8 | 10,000,000 |
| T9 | 100,000,000 |
| T10 | 1,000,000,000 |

### Tareas Técnicas
- [ ] Definir tabla de umbrales de tier unlock
- [ ] Implementar función `checkTierUnlock(currentCPS)`
- [ ] Notificar al jugador (toast/animación) al desbloquear tier
- [ ] Filtrar upgrades por tier desbloqueado en el shop

---

## HU-013: Persistencia de Progreso

**Como** jugador,
**Quiero** que mi progreso se guarde automáticamente,
**Para** poder continuar mi partida más tarde desde el mismo punto.

### Criterios de Aceptación
- [ ] El progreso se guarda automáticamente cada 30 segundos
- [ ] El progreso se guarda al comprar un upgrade
- [ ] El progreso se guarda al cerrar el juego
- [ ] Al cargar el juego, se restaura: coins, nivel de upgrades, tiers desbloqueados
- [ ] Se calculan los coins generados offline desde la última sesión
- [ ] Los datos se guardan en el servidor (backend) via WebSocket

### Datos a Persistir
- [ ] Cantidad actual de coins
- [ ] Nivel de cada upgrade poseído
- [ ] Tier máximo desbloqueado
- [ ] Timestamp de última conexión
- [ ] (Opcional) Logros obtenidos

### Tareas Técnicas
- [ ] Implementar endpoint WebSocket para save/load
- [ ] Serializar estado del juego a JSON
- [ ] Calcular offline earnings: `coins + (CPS * secondsOffline)`
- [ ] Implementardebounce para guardado automático
- [ ] Manejar casos de corrupción de datos

---

## HU-014: Game Over / Reset

**Como** jugador,
**Quiero** poder reiniciar mi progreso desde cero,
**Para** comenzar una nueva partida si lo deseo.

### Criterios de Aceptación
- [ ] Hay una opción en el menú para reiniciar el juego
- [ ] Al confirmar el reset, todos los datos se borran (coins, upgrades, tiers)
- [ ] El juego vuelve al estado inicial (0 coins, solo T1, sin upgrades)
- [ ] Se requiere confirmación explícita antes del reset (modal)
- [ ] El reset borra también el progreso del servidor

### Estado Inicial tras Reset
- [ ] Coins: 0
- [ ] CPC: 1
- [ ] CPS: 0
- [ ] Upgrades: ninguno
- [ ] Tier desbloqueado: T1

### Tareas Técnicas
- [ ] Crear botón de reset en UI
- [ ] Implementar modal de confirmación
- [ ] Implementar función `resetGame()`
- [ ] Limpiar datos locales y del servidor

---

## HU-015: Sistema de Logros

**Como** jugador,
**Quiero** obtener logros al alcanzar ciertos hitos,
**Para** sentir reconocimiento por mi progreso y tener objetivos.

### Criterios de Aceptación
- [ ] Los logros se otorgan automáticamente al cumplir las condiciones
- [ ] Cada logro tiene un nombre, descripción e icono
- [ ] Se muestra una notificación al obtener un logro
- [ ] Los logros obtenidos se guardan y persisten
- [ ] Se puede ver una lista de todos los logros (obtenidos y no obtenidos)

### Lista de Logros Propuestos
| Logro | Condición | Recompensa |
|-------|-----------|-------------|
| Primer Click | Hacer el primer click | - |
| Primera Compra | Comprar primer upgrade | - |
| Mil Coins | Llegar a 1,000 coins | - |
| Million Coins | Llegar a 1,000,000 coins | - |
| Billion Coins | Llegar a 1,000,000,000 coins | - |
| Dedo Dorado | Comprar 10 upgrades click | - |
| Inversionista | Comprar 10 upgrades passive | - |
| Coleccionista | Desbloquear todos los tiers | - |
| Máquina | Tener CPS > 1,000,000 | - |
| Adicto | Jugar 7 días consecutivos | - |

### Tareas Técnicas
- [ ] Definir estructura de logros con condiciones
- [ ] Implementar sistema de verificación de logros
- [ ] Crear notificación de logro obtenido
- [ ] Crear pantalla de galería de logros

---

## HU-016: Recompensas Diarias

**Como** jugador,
**Quiero** recibir una bonificación por conectarme diariamente,
**Para** incentivarme a jugar regularmente y obtener un bonus de coins.

### Criterios de Aceptación
- [ ] Al conectarse, el juego verifica si es un nuevo día
- [ ] Si es el primer登录 del día, se otorga una recompensa diaria
- [ ] La recompensa diaria aumenta cuanto más días consecutivos se juega
- [ ] Se muestra un contador/regresivo hasta la próxima recompensa
- [ ] Se muestra una animación especial al recibir la recompensa
- [ ] El streak de días se guarda y persiste

### Sistema de Recompensas
| Día Consecutivo | Recompensa |
|-----------------|------------|
| 1 | 100 coins |
| 2 | 200 coins |
| 3 | 400 coins |
| 4 | 800 coins |
| 5+ | 1,600 coins (máximo) |

### Tareas Técnicas
- [ ] Guardar fecha de último login
- [ ] Verificar si es un nuevo día (comparar fechas)
- [ ] Calcular streak de días consecutivos
- [ ] Calcular recompensa según tabla
- [ ] Mostrar animación de recompensa diaria

---

## HU-017: Animaciones y Feedback Visual

**Como** jugador,
**Quiero** ver efectos visuales al interactuar con el juego,
**Para** sentir satisfacción y respuesta a mis acciones.

### Criterios de Aceptación
- [ ] Al hacer click, aparecen partículas/animación de coins flotando
- [ ] Los números de coins ganados aparecen y se animan (popup de daño)
- [ ] Al comprar un upgrade, hay animación de confirmación
- [ ] Los botones tienen estados hover/active con feedback visual
- [ ] Los upgrades en el shop tienen animación al aparecer
- [ ] Las transiciones entre pantallas son suaves

### Tipos de Animaciones
- [ ] **Click**: Partículas de moneda, texto flotante "+X"
- [ ] **Compra**: Flash verde, vibración, progreso
- [ ] **Upgrade unlock**: Efecto de brillo, notificación
- [ ] **Tier unlock**: Animación especial, efectos de celebración
- [ ] **Coins generation pasiva**: Indicador visual sutil

### Tareas Técnicas
- [ ] Implementar sistema de partículas en Phaser
- [ ] Crear popup de texto animado para coins
- [ ] Diseñar animations para compra exitosa/fallida
- [ ] Añadir transiciones CSS para UI
- [ ] Implementar feedback háptico si está disponible

---

## HU-018: Sistema de Audio

**Como** jugador,
**Quiero** escuchar sonidos al interactuar con el juego,
**Para** mejorar la experiencia inmersiva y recibir feedback auditivo.

### Criterios de Aceptación
- [ ] Sonido de click al hacer click en el área de juego
- [ ] Sonido de compra al adquirir un upgrade
- [ ] Sonido de error cuando no se puede comprar (insufficient funds)
- [ ] Sonido de notificación al desbloquear un tier
- [ ] Música de fondo (opcional, con control de volumen)
- [ ] Control de mute/silencio accesible

### Efectos de Sonido Requeridos
| Evento | Sound Effect |
|--------|--------------|
| Click | Moneda/Chime corto |
| Compra | Sonido de "cash register" o compra exitosa |
| Error | Tono de error suave |
| Tier Unlock | Fanfare/Celebración |
| Logro | Chime especial |

### Tareas Técnicas
- [ ] Cargar archivos de audio (mp3/ogg)
- [ ] Implementar AudioManager en Phaser
- [ ] Reproducir efectos sincronizados con acciones
- [ ] Añadir control de volumen en settings
- [ ] Implementar mute toggle

---

## HU-019: Conexión WebSocket con Servidor

**Como** jugador,
**Quiero** que el juego se comunique con el servidor en tiempo real,
**Para** sincronizar mi progreso y competir con otros.

### Criterios de Aceptación
- [ ] Al iniciar, el cliente establece conexión WebSocket con el servidor
- [ ] La conexión se mantiene activa durante toda la sesión
- [ ] Se muestra indicador de estado de conexión (conectado/desconectando/error)
- [ ] Si la conexión se pierde, el cliente intenta reconectar automáticamente
- [ ] Los mensajes se envían y reciben en formato JSON
- [ ] El servidor responde a: save, load, getLeaderboard

### Eventos WebSocket
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `connect` | Server→Client | Confirmación de conexión |
| `save` | Client→Server | Guardar progreso |
| `load` | Client→Server | Cargar progreso |
| `leaderboard` | Server→Client | Rankings |
| `error` | Server→Client | Error del servidor |

### Tareas Técnicas
- [ ] Implementar cliente Socket.io en React
- [ ] Manejar eventos de conexión/desconexión
- [ ] Implementar retry con backoff exponencial
- [ ] Mostrar UI de estado de conexión

---

## HU-020: Validación de Compras en Servidor

**Como** sistema,
**Quiero** validar las compras de upgrades en el servidor,
**Para** prevenir trampas y mantener integridad del juego.

### Criterios de Aceptación
- [ ] Al comprar un upgrade, el servidor verifica: coins suficientes, nivel < maxLevel
- [ ] La validación ocurre antes de confirmar la compra
- [ ] Si la validación falla, el servidor rechaza la compra y envía error
- [ ] El servidor es la fuente de verdad para el estado del juego
- [ ] Las races conditions se manejan correctamente (dos compras simultáneas)

### Validaciones del Servidor
- [ ] `coins >= costoUpgrade` - Verificar fondos suficientes
- [ ] `nivel < maxLevel` - Verificar no está al máximo
- [ ] `upgradeId existe` - Verificar upgrade válido
- [ ] `timestamp válido` - Prevenir replay attacks

### Tareas Técnicas
- [ ] Crear endpoint de validación de compra
- [ ] Implementar locks/transacciones para evitar races
- [ ] Responder con éxito o error detallado
- [ ] Sincronizar estado del cliente tras validación

---

## HU-021: Serialización del Estado del Juego

**Como** sistema,
**Quiero** convertir el estado del juego a JSON y viceversa,
**Para** poder guardar, cargar y transmitir el progreso.

### Criterios de Aceptación
- [ ] El estado se serializa a JSON válido
- [ ] El estado se puede deserializar restaurando el objeto original
- [ ] Se manejan correctamente: valores null, undefined, arrays, objetos anidados
- [ ] Los números grandes no pierden precisión
- [ ] La versión del formato se incluye para migración

### Estructura de Estado Serializado
```json
{
  "version": "1.0",
  "coins": 15000,
  "upgrades": {
    "click_1_1": 5,
    "passive_2_1": 3
  },
  "unlockedTier": 3,
  "lastSaveTime": 1699999999999,
  "achievements": ["first_click", "first_purchase"]
}
```

### Tareas Técnicas
- [ ] Implementar `serializeGameState()` 
- [ ] Implementar `deserializeGameState(json)`
- [ ] Validar estructura al cargar
- [ ] Migrar formatos de versiones anteriores
- [ ] Manejar errores de parseo

---

## HU-022: Gestión de Errores y Reconexión

**Como** jugador,
**Quiero** que el juego maneje errores gracefully,
**Para** no perder progreso y entender qué pasó.

### Criterios de Aceptación
- [ ] Si la conexión se pierde, el juego sigue funcionando localmente
- [ ] Se muestra notificación cuando hay error de conexión
- [ ] El juego intenta reconectar automáticamente (máx 3 intentos)
- [ ] Si la reconexión falla, se permite jugar offline
- [ ] Los cambios offline se sincronizan al reconectar
- [ ] Los errores críticos muestran mensaje claro y opción de retry

### Errores a Manejar
| Error | Comportamiento |
|-------|---------------|
| Conexión perdida | Reintento automático, UI indicator |
| Servidor no responde | Modo offline, guardar local |
| Datos corruptos | Usar valores por defecto, notificar |
| Timeout de operación | Retry con backoff |

### Tareas Técnicas
- [ ] Implementar manejo de errores global
- [ ] Crear cola de operaciones para sincronizar offline
- [ ] Implementar retry con backoff exponencial
- [ ] Mostrar toast/notificaciones de errores

---

## HU-023: Casos Límite y Validación de Datos

**Como** sistema,
**Quiero** validar todos los datos del juego,
**Para** prevenir comportamientos inesperados.

### Criterios de Aceptación
- [ ] Los coins nunca pueden ser negativos
- [ ] El nivel de upgrade nunca supera maxLevel
- [ ] Los cálculos no generan NaN o Infinity
- [ ] Los tiers desbloqueados están en rango válido (1-10)
- [ ] Los IDs de upgrades existen en el catálogo
- [ ] Los valores por defecto se usan si hay datos faltantes

### Validaciones Requeridas
```javascript
// Ejemplos de validaciones
if (coins < 0) coins = 0;
if (upgrade.level > upgrade.maxLevel) upgrade.level = upgrade.maxLevel;
if (!isFinite(total)) total = 0;
if (!catalog[upgradeId]) throw new Error('Upgrade no encontrado');
```

### Tareas Técnicas
- [ ] Crear funciones de validación
- [ ] Validar al cargar desde servidor/localStorage
- [ ] Validar antes de cálculos
- [ ] Lanzar errores claros en validación fails

---

## HU-024: Sistema de Prestigio

**Como** jugador avanzado,
**Quiero** reiniciar el juego conservando un bonus permanente,
**Para** obtener una progresión más rápida en siguientes partidas.

### Criterios de Aceptación
- [ ] El jugador puede hacer prestige al llegar a cierto CPS mínimo (ej: 1M)
- [ ] Al hacer prestige: coins, upgrades y tiers se reinician
- [ ] Se otorga un multiplicador basado en el CPS actual
- [ ] El multiplicador de prestige aplica a TODA generación de coins
- [ ] El prestige se puede hacer una vez por día máximo
- [ ] Se muestra el multiplicador de prestige en la UI

### Fórmula de Prestigio
```
multiplier = floor(CPS / 1,000,000) + 1
Ejemplo: 5M CPS → multiplier = 6x para siempre
```

### Tareas Técnicas
- [ ] Implementar verificación de requisitos de prestige
- [ ] Calcular y guardar multiplicador de prestige
- [ ] Aplicar multiplicador a CPC y CPS
- [ ] Mostrar UI de prestige (botón, preview de bonus)

---

## HU-025: Estados del Juego

**Como** sistema,
**Quiero** manejar los diferentes estados del juego,
**Para** controlar el flujo y comportamiento appropriately.

### Criterios de Aceptación
- [ ] Estado LOADING: Se muestran assets, no se puede interactuar
- [ ] Estado PLAYING: Juego activo, clicks y compras habilitados
- [ ] Estado PAUSED: Juego detenido, UI de pausa visible
- [ ] Estado SAVING: Guardando, indicador visual
- [ ] Estado ERROR: Error crítico, opciones de recovery

### Transiciones de Estado
```
LOADING → PLAYING → [PAUSED | SAVING | ERROR]
                    ↓
                 GAMEOVER (si aplica)
```

### Tareas Técnicas
- [ ] Crear máquina de estados
- [ ] Bloquear input en estados no activos
- [ ] Mostrar UI apropiada por estado
- [ ] Persistir solo en PLAYING/PAUSED

---

## HU-026: Optimización de Cálculos

**Como** sistema,
**Quiero** optimizar los cálculos del juego,
**Para** mantener rendimiento fluido con muchos upgrades.

### Criterios de Aceptación
- [ ] El cálculo de CPS total es O(n) donde n = upgrades comprados
- [ ] No se recalcula CPC/CPS en cada frame
- [ ] Los números grandes se formatean eficientemente
- [ ] El consumo de memoria es estable (no memory leaks)
- [ ] 60 FPS se mantiene con 66 upgrades y 1000+ CPS

### Técnicas de Optimización
- [ ] Cachear CPC y CPS calculados, actualizar solo al comprar
- [ ] Usar BigInt para números muy grandes
- [ ] Usar memoización para cálculos repetidos
- [ ] throttlear actualizaciones de UI

### Tareas Técnicas
- [ ] Implementar calculateCPC() con cache
- [ ] Implementar calculateCPS() con cache
- [ ] Medir rendimiento con DevTools
- [ ] Optimizar formateo de números

---

| HU-020 | Alta | 3 | HU-019, HU-013 |
| HU-021 | Alta | 3 | HU-013 |
| HU-022 | Media | 3 | HU-019 |
| HU-023 | Alta | 1 | - |
| HU-024 | Media | 5 | HU-011, HU-013 |
| HU-025 | Media | 1 | - |
| HU-026 | Media | 3 | HU-003, HU-005 |
| HU-014 | Baja | 3 | HU-013 |
| HU-015 | Baja | 4 | HU-011, HU-013 |
| HU-016 | Baja | 4 | HU-013 |
| HU-017 | Media | 2 | HU-001, HU-008 |
| HU-018 | Baja | 4 | HU-001, HU-008 |

## Resumen de Cobertura

| Categoría | HUs | Estado |
|-----------|-----|--------|
| Core Gameplay | HU-001 a HU-006 | ✅ Completo |
| Shop y Compras | HU-007 a HU-010 | ✅ Completo |
| Progresión | HU-011 a HU-012 | ✅ Completo |
| Persistencia | HU-013, HU-021 | ✅ Completo |
| Sistema | HU-014, HU-022 a HU-026 | ✅ Completo |
| Features | HU-015 a HU-018 | ✅ Completo |
| Networking | HU-019 a HU-020 | ✅ Completo |

**Total: 26 Historias de Usuario**
