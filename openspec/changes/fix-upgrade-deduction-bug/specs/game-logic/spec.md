# Delta for Game Logic

## Purpose

Corregir bug de estado stale en los flujos de click y compra. ProcessClickUseCase y PurchaseUpgradeUseCase leían player.coins antes de invocar updateCoins() e ignoraban el valor de retorno, causando que newCoins retornara valores stale.

---

## MODIFIED Requirements

### Requirement: ProcessClickUseCase - Retornar estado fresco

El ProcessClickUseCase DEBE retornar el valor de newCoins directamente desde el valor de retorno de updateCoins(), no desde player.coins antes de la actualización.

(Previously: Leía player.coins antes de updateCoins() y retornaba valor stale)

#### Scenario: Click retorna monedas correctas después de compra exacta

- GIVEN Un jugador con 0 monedas
- WHEN El jugador compra un upgrade que cuesta exactamente sus monedas
- AND Luego hace click
- THEN El valor de newCoins en la respuesta DEBE ser 1

#### Scenario: Click retorna monedas correctas después de compra parcial

- GIVEN Un jugador con 5 monedas
- WHEN El jugador compra un upgrade de 5 monedas
- AND Luego hace click
- THEN El valor de newCoins en la respuesta DEBE ser 7 (5 + coinsPerClick)

---

### Requirement: PurchaseUpgradeUseCase - Retornar estado fresco

El PurchaseUpgradeUseCase DEBE retornar el valor de newCoins directamente desde el valor de retorno de updateCoins(), no desde player.coins antes de la actualización.

(Previously: Leía player.coins antes de updateCoins() y retornaba valor stale)

#### Scenario: Compra exacta de upgrade retorna monedas correctas

- GIVEN Un jugador con 20 monedas
- AND Un upgrade que cuesta 20 monedas
- WHEN El jugador compra el upgrade
- THEN El valor de newCoins en la respuesta DEBE ser 0

#### Scenario: Compra con resto retorna monedas correctas

- GIVEN Un jugador con 25 monedas
- AND Un upgrade que cuesta 20 monedas
- WHEN El jugador compra el upgrade
- THEN El valor de newCoins en la respuesta DEBE ser 5

---

### Requirement: InMemoryPlayerRepository.updateCoins - Retornar jugador actualizado

El método updateCoins() del repositorio in-memory DEBE retornar el jugador con el estado actualizado, incluyendo el nuevo valor de monedas.

(Previously: Podía no retornar el estado actualizado o retornar void)

#### Scenario: updateCoins retorna estado post-actualización

- GIVEN Un jugador con 10 monedas
- WHEN Se llama updateCoins con coinsDelta +5
- THEN El valor de retorno DEBE contener player.coins = 15

---

### Requirement: Tests existentes - Sin regresiones

Todos los tests existentes DEBEN continuar pasando después del fix.

#### Scenario: Tests de UseCase pasan

- GIVEN Los tests existentes de ProcessClickUseCase y PurchaseUpgradeUseCase
- WHEN Se ejecutan después del fix
- THEN Todos los tests DEBEN pasar sin modificaciones

---

## Coverage

### Happy Paths
- [x] Click después de compra exacta retorna 1 moneda
- [x] Click después de compra parcial retorna cantidad correcta
- [x] Compra con resto retorna saldo correcto
- [x] updateCoins retorna estado actualizado

### Edge Cases
- [x] Compra exacta (20/20) deja 0 monedas
- [x] Compra con resto (25/20) deja 5 monedas
- [x] Click después de 0 monedas retorna 1

### Error States
- [x] Comportamiento con INSFFICIENT_COINS no cambia (ya manejado)
