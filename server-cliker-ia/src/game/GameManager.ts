import { Room } from '../game/Room.js';
import { Player } from '../game/Player.js';
import { Shop } from '../shop/Shop.js';
import type { RoomInfo, PlayerInfo, ShopInfo } from '../types/index.js';

const MAX_ROOMS = 10;
const MAX_SHOPS_PER_ROOM = 10;

let roomIdCounter = 0;
let shopIdCounter = 0;

function generateRoomId(): string {
  return `room_${++roomIdCounter}`;
}

function generateShopId(): string {
  return `shop_${++shopIdCounter}`;
}

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();

  createRoom(name: string): { success: boolean; room?: RoomInfo; error?: string } {
    if (this.rooms.size >= MAX_ROOMS) {
      return { success: false, error: 'MAX_ROOMS_REACHED' };
    }

    const id = generateRoomId();
    const room = new Room(id, name);
    this.rooms.set(id, room);

    return { success: true, room: room.toInfo() };
  }

  getRooms(): RoomInfo[] {
    return Array.from(this.rooms.values()).map((r) => r.toInfo());
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomInfo(roomId: string): RoomInfo | undefined {
    return this.rooms.get(roomId)?.toInfo();
  }

  joinRoom(roomId: string, playerId: string, playerName: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    if (room.isFull()) {
      return { success: false, error: 'ROOM_FULL' };
    }

    let player = this.players.get(playerId);
    if (!player) {
      player = new Player(playerId, playerName);
      this.players.set(playerId, player);
    }

    const added = room.addPlayer(player);
    if (!added) {
      return { success: false, error: 'ROOM_FULL' };
    }

    return { success: true };
  }

  leaveRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.removePlayer(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  createShop(roomId: string, name: string, ownerId: string): { success: boolean; shop?: ShopInfo; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    if (room.shops.size >= MAX_SHOPS_PER_ROOM) {
      return { success: false, error: 'MAX_SHOPS_PER_ROOM' };
    }

    const shopId = generateShopId();
    const shop = new Shop(shopId, name, ownerId, roomId);
    room.addShop(shop);

    return { success: true, shop: shop.toInfo() };
  }

  getShops(roomId: string): ShopInfo[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return room.getShopsInfo();
  }

  getShop(roomId: string, shopId: string): Shop | undefined {
    const room = this.rooms.get(roomId);
    return room?.getShop(shopId);
  }

  buyItem(roomId: string, shopId: string, playerId: string, itemId: string, quantity: number): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const shop = room.getShop(shopId);
    if (!shop) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    const item = shop.getItem(itemId);
    if (!item) {
      return { success: false, error: 'ITEM_NOT_FOUND' };
    }

    const totalPrice = item.price * quantity;
    if (!player.removeCoins(totalPrice)) {
      return { success: false, error: 'INSUFFICIENT_COINS' };
    }

    const buyResult = shop.buyItem(itemId, quantity);
    if (!buyResult.success) {
      player.addCoins(totalPrice);
      return { success: false, error: buyResult.error };
    }

    player.addItem(itemId, quantity);
    return { success: true };
  }

  sellItem(roomId: string, shopId: string, playerId: string, itemId: string, quantity: number): { success: boolean; error?: string; coins?: number } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'ROOM_NOT_FOUND' };
    }

    const shop = room.getShop(shopId);
    if (!shop) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    if (!player.removeItem(itemId, quantity)) {
      return { success: false, error: 'NOT_ENOUGH_ITEMS' };
    }

    const sellResult = shop.sellItem(itemId, quantity);
    if (!sellResult.success) {
      player.addItem(itemId, quantity);
      return { success: false, error: sellResult.error };
    }

    const totalCoins = (sellResult.sellPrice || 0) * quantity;
    player.addCoins(totalCoins);

    return { success: true, coins: totalCoins };
  }
}

export const gameManager = new GameManager();
