import { Player } from './Player.js';
import { Shop } from '../shop/Shop.js';
import type { Room as RoomType, RoomInfo, PlayerInfo, ShopInfo } from '../types/index.js';

export class Room implements RoomType {
  id: string;
  name: string;
  maxPlayers: number;
  players: Map<string, Player>;
  shops: Map<string, Shop>;
  createdAt: Date;

  constructor(id: string, name: string, maxPlayers: number = 20) {
    this.id = id;
    this.name = name;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.shops = new Map();
    this.createdAt = new Date();
  }

  addPlayer(player: Player): boolean {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }
    this.players.set(player.id, player);
    return true;
  }

  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  addShop(shop: Shop): boolean {
    if (this.shops.size >= 10) {
      return false;
    }
    this.shops.set(shop.id, shop);
    return true;
  }

  removeShop(shopId: string): boolean {
    return this.shops.delete(shopId);
  }

  getShop(shopId: string): Shop | undefined {
    return this.shops.get(shopId);
  }

  isFull(): boolean {
    return this.players.size >= this.maxPlayers;
  }

  toInfo(): RoomInfo {
    return {
      id: this.id,
      name: this.name,
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      shopCount: this.shops.size,
    };
  }

  getPlayersInfo(): PlayerInfo[] {
    return Array.from(this.players.values()).map((p) => p.toInfo());
  }

  getShopsInfo(): ShopInfo[] {
    return Array.from(this.shops.values()).map((s) => s.toInfo());
  }
}
