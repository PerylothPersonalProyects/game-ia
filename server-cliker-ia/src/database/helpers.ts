import type { Player, PlayerGameState } from './types';

export function parsePlayerRow(row: any): Player {
  return {
    id: row.id,
    playerId: row.player_id,
    coins: Number(row.coins) || 0,
    coinsPerClick: Number(row.coins_per_click) || 1,
    coinsPerSecond: Number(row.coins_per_second) || 0,
    upgrades: typeof row.upgrades === 'string' ? JSON.parse(row.upgrades) : (row.upgrades || []),
    shopUpgrades: typeof row.shop_upgrades === 'string' ? JSON.parse(row.shop_upgrades) : (row.shop_upgrades || []),
    lastUpdate: Number(row.last_update) || Date.now(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parsePlayerToGameState(player: Player): PlayerGameState {
  return {
    playerId: player.playerId,
    coins: player.coins,
    coinsPerClick: player.coinsPerClick,
    coinsPerSecond: player.coinsPerSecond,
    upgrades: player.upgrades,
    shopUpgrades: player.shopUpgrades,
    lastUpdate: player.lastUpdate,
  };
}

export function serializePlayerData(data: Partial<PlayerGameState>, existingPlayer?: Player): any {
  return {
    player_id: data.playerId,
    coins: data.coins ?? existingPlayer?.coins ?? 0,
    coins_per_click: data.coinsPerClick ?? existingPlayer?.coinsPerClick ?? 1,
    coins_per_second: data.coinsPerSecond ?? existingPlayer?.coinsPerSecond ?? 0,
    upgrades: JSON.stringify(data.upgrades ?? existingPlayer?.upgrades ?? []),
    shop_upgrades: JSON.stringify(data.shopUpgrades ?? existingPlayer?.shopUpgrades ?? []),
    last_update: BigInt(Date.now()).toString(),
  };
}
