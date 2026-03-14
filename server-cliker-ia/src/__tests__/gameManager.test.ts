import { describe, it, expect, beforeEach } from 'vitest';
import { GameManager } from '../game/GameManager.js';

describe('GameManager', () => {
  let manager: GameManager;

  beforeEach(() => {
    manager = new GameManager();
  });

  describe('Rooms', () => {
    it('should create a room', () => {
      const result = manager.createRoom('Test Room');
      expect(result.success).toBe(true);
      expect(result.room).toBeDefined();
      expect(result.room?.name).toBe('Test Room');
    });

    it('should get list of rooms', () => {
      manager.createRoom('Room 1');
      manager.createRoom('Room 2');
      const rooms = manager.getRooms();
      expect(rooms).toHaveLength(2);
    });

    it('should enforce max rooms limit (10)', () => {
      for (let i = 0; i < 10; i++) {
        manager.createRoom(`Room ${i}`);
      }
      const result = manager.createRoom('Extra Room');
      expect(result.success).toBe(false);
      expect(result.error).toBe('MAX_ROOMS_REACHED');
    });

    it('should join a room', () => {
      const roomResult = manager.createRoom('Test Room');
      const joinResult = manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      expect(joinResult.success).toBe(true);
    });

    it('should not join non-existent room', () => {
      const result = manager.joinRoom('invalid', 'player1', 'Player 1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ROOM_NOT_FOUND');
    });

    it('should not join full room', () => {
      const roomResult = manager.createRoom('Full Room');
      for (let i = 0; i < 20; i++) {
        manager.joinRoom(roomResult.room!.id, `player${i}`, `Player ${i}`);
      }
      const result = manager.joinRoom(roomResult.room!.id, 'player21', 'Player 21');
      expect(result.success).toBe(false);
      expect(result.error).toBe('ROOM_FULL');
    });

    it('should leave a room', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const left = manager.leaveRoom(roomResult.room!.id, 'player1');
      expect(left).toBe(true);
    });
  });

  describe('Shops', () => {
    it('should create a shop', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const result = manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      expect(result.success).toBe(true);
      expect(result.shop).toBeDefined();
      expect(result.shop?.name).toBe('Tienda 1');
    });

    it('should get shops in a room', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      manager.createShop(roomResult.room!.id, 'Tienda 2', 'player1');
      const shops = manager.getShops(roomResult.room!.id);
      expect(shops).toHaveLength(2);
    });

    it('should enforce max shops per room (10)', () => {
      const roomResult = manager.createRoom('Test Room');
      for (let i = 0; i < 10; i++) {
        manager.createShop(roomResult.room!.id, `Tienda ${i}`, 'player1');
      }
      const result = manager.createShop(roomResult.room!.id, 'Extra Shop', 'player1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('MAX_SHOPS_PER_ROOM');
    });
  });

  describe('Trading', () => {
    it('should buy item from shop', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const shopResult = manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      
      const shop = manager.getShop(roomResult.room!.id, shopResult.shop!.id);
      const item = shop?.items[0];
      
      const result = manager.buyItem(
        roomResult.room!.id,
        shopResult.shop!.id,
        'player1',
        item!.id,
        1
      );
      expect(result.success).toBe(true);
    });

    it('should fail if insufficient coins', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const shopResult = manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      
      const shop = manager.getShop(roomResult.room!.id, shopResult.shop!.id);
      const item = shop?.items[0];

      const player = manager.getPlayer('player1');
      player!.coins = 0;

      const result = manager.buyItem(
        roomResult.room!.id,
        shopResult.shop!.id,
        'player1',
        item!.id,
        1
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_COINS');
    });

    it('should fail if out of stock', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const shopResult = manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      
      const shop = manager.getShop(roomResult.room!.id, shopResult.shop!.id);
      const item = shop?.items[0];
      shop!.buyItem(item!.id, item!.maxStock);

      const result = manager.buyItem(
        roomResult.room!.id,
        shopResult.shop!.id,
        'player1',
        item!.id,
        1
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('OUT_OF_STOCK');
    });

    it('should sell item', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const shopResult = manager.createShop(roomResult.room!.id, 'Tienda 1', 'player1');
      
      const shop = manager.getShop(roomResult.room!.id, shopResult.shop!.id);
      const item = shop?.items[0];
      
      manager.buyItem(roomResult.room!.id, shopResult.shop!.id, 'player1', item!.id, 1);
      
      const result = manager.sellItem(
        roomResult.room!.id,
        shopResult.shop!.id,
        'player1',
        item!.id,
        1
      );
      expect(result.success).toBe(true);
      expect(result.coins).toBeGreaterThan(0);
    });
  });

  describe('Player', () => {
    it('should have initial coins', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const player = manager.getPlayer('player1');
      expect(player?.coins).toBe(1000);
    });

    it('should add and remove coins', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const player = manager.getPlayer('player1')!;
      
      player.addCoins(100);
      expect(player.coins).toBe(1100);
      
      const removed = player.removeCoins(500);
      expect(removed).toBe(true);
      expect(player.coins).toBe(600);
    });

    it('should not remove more coins than available', () => {
      const roomResult = manager.createRoom('Test Room');
      manager.joinRoom(roomResult.room!.id, 'player1', 'Player 1');
      const player = manager.getPlayer('player1')!;
      
      const removed = player.removeCoins(2000);
      expect(removed).toBe(false);
      expect(player.coins).toBe(1000);
    });
  });
});
