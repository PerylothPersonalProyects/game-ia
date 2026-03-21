# Tasks: fix-coin-superposition-bug

## Implementation Tasks

### Backend Tasks

- [x] 1.1 Fix gameController.ts - Add `coins` to upgrade response (line ~218)
- [x] 1.2 Fix IdleGameService.ts - Remove `player.coins = state.coins` vulnerability (line ~382)
- [x] 1.3 Update types/idle-game.ts - Add `coins?: number` to ApiResponse

### Frontend Tasks

- [x] 2.1 Update gameApi.ts - Add `UpgradePurchaseResponse` type with `coins`
- [x] 2.2 Update useGameState.ts - Use coins from upgrade response (no extra fetch)

### Verification

- [x] 3.1 Server TypeScript build passes
- [x] 3.2 Client TypeScript build passes
- [x] 3.3 Server tests pass (94 tests)
- [x] 3.4 Client tests pass (69 tests)

## Completed

All tasks completed on 2026-03-20.
