# Proposal: Fix Stale State in Click/Purchase Flows

## Intent

Corregir bug crítico donde ProcessClickUseCase y PurchaseUpgradeUseCase retornan valores de newCoins stale debido a que leen player.coins antes de invocar updateCoins() y luego ignoran el valor de retorno.

## Background

### Root Cause

En el flujo actual:
1. El use case lee `player.coins` (valor antiguo)
2. Calcula `newCoins = player.coins + delta`
3. Llama a `updateCoins(newCoins)`
4. Retorna `newCoins` (que fue calculado con valor stale)

El problema es que si otro proceso modifica el estado del jugador entre los pasos 1 y 3, el valor retornado no refleja el estado real de la base de datos.

### Solution

Usar el valor de retorno de `updateCoins()` que contiene el estado real actualizado del jugador. El repositorio debe retornar el jugador actualizado, no void.

## Scope

### In Scope
- `ProcessClickUseCase` - usar valor de retorno de updateCoins
- `PurchaseUpgradeUseCase` - usar valor de retorno de updateCoins
- `InMemoryPlayerRepository.updateCoins` - retornar jugador actualizado
- Tests que validen el comportamiento correcto

### Out of Scope
- Cambios en la API REST
- Cambios en WebSocket
- Cambios en el frontend

## Affected Areas

- `src/game/useCases/ProcessClickUseCase.ts`
- `src/game/useCases/PurchaseUpgradeUseCase.ts`
- `src/infrastructure/repositories/InMemoryPlayerRepository.ts`
- `src/domain/entities/Player.ts` (interfaz del repositorio)

## Approach

1. Modificar `InMemoryPlayerRepository.updateCoins` para retornar el `Player` actualizado en lugar de void
2. Modificar `ProcessClickUseCase.execute` para usar el valor de retorno de `updateCoins`
3. Modificar `PurchaseUpgradeUseCase.execute` para usar el valor de retorno de `updateCoins`
4. Actualizar tests existentes para verificar que newCoins coincide con el estado real

## Rollback Plan

Si el cambio causa regresiones:
1. Revertir cambios en use cases a versión anterior
2. Modificar `updateCoins` para retornar void nuevamente
3. Desplegar versión estable

## Verification

Ejecutar:
```bash
npm test
```

Todos los tests existentes deben pasar. Tests específicos cubrirán:
- newCoins retorna valor correcto después de compra exacta
- newCoins retorna valor correcto después de compra con resto
- newCoins retorna 1 después de click con 0 monedas previas
