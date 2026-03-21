# Design: Fix Upgrade Deduction Bug (Stale Coin Values)

## Technical Approach

**Pattern**: Use Return Value from Repository — capture the fresh player state returned by `updateCoins()` instead of recalculating from stale data.

## Root Cause Analysis

| Component | Issue |
|-----------|-------|
| `ProcessClickUseCase.execute()` | Calls `updateCoins()` but ignores return value. Uses `player.coins` (fetched before update) in response. |
| Repository (`updateCoins`) | Already returns `Promise<Player | null>` — correctly implemented. |

**Bug Flow**:
1. `player = await findById(id)` → coins = 0
2. Click → `processClick()` → earned = 1
3. `await updateCoins(id, +1)` → DB now has 1
4. `return { newCoins: player.coins + 1 }` → returns **1** (based on stale 0)

**Scenario**: Player has 20 coins, buys upgrade (cost 20):
- `PurchaseUpgradeUseCase` updates DB to 0 coins, returns only `success: true, upgrade`
- Client still thinks player has 20 (no `newCoins` in response)
- If client doesn't re-fetch, subsequent click uses wrong baseline

## Architecture Decisions

### Decision 1: Use Return Value Pattern

**Choice**: Capture `updateCoins()` return value  
**Alternatives**: 
- Re-fetch player after update (extra DB call)
- Calculate new value before update (same as current, has race condition)

**Rationale**: Repository already returns updated player — zero additional cost, ensures consistency.

## File Changes

| File | Action | Change |
|------|--------|--------|
| `src/usecases/ProcessClickUseCase.ts` | Modify | Capture return from `updateCoins()`, use `updatedPlayer!.coins` |

**Files to Verify** (no changes needed):
- `src/adapters/in-memory/index.ts` — `updateCoins()` already returns updated player ✓
- `src/usecases/PurchaseUpgradeUseCase.ts` — Uses `update()` with inline calculation; `PurchaseUpgradeResult` doesn't expose `newCoins`

## Code Changes

### ProcessClickUseCase.ts (AFTER fix)

```typescript
async execute(playerId: string): Promise<ClickResult> {
  const player = await this.playerRepo.findById(playerId);
  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  const result = GameCalculator.processClick(player);
  
  // FIX: Capture return value for fresh coin count
  const updatedPlayer = await this.playerRepo.updateCoins(playerId, result.earned);
  
  return {
    earned: result.earned,
    newCoins: updatedPlayer!.coins,  // Fresh value from DB
    coinsPerClick: result.coinsPerClick,
  };
}
```

## Data Flow

```
Client Request
     │
     ▼
┌─────────────────┐
│ ProcessClick    │
│ 1. findById()  │──→ player.coins = 0 (from DB)
│ 2. processClick│──→ earned = 1
│ 3. updateCoins()│──→ DB: coins = 1, returns { coins: 1 }
│ 4. Return       │──→ newCoins: 1 ✓
└─────────────────┘
     │
     ▼
Client Update: player.coins = 1
```

## Testing Strategy

| Test | File | Expected |
|------|------|----------|
| Bug001: Click after purchase | `Bug001ClickAfterPurchase.test.ts` | Shows correct coins after click |
| Full suite | `*.test.ts` | No regressions |

**Manual Test**:
1. Start with 20 coins
2. Buy upgrade (cost: 20) → 0 coins
3. Click once
4. UI should show: 1 coin ✓

## Open Questions

- **None** — Root cause identified, fix is straightforward.
