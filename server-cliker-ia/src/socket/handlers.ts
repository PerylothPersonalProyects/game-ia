import type { ServerToClientEvents, ClientToServerEvents, InventoryInfo } from '../types/index.js';
import { gameManager } from '../game/GameManager.js';

type SocketType = {
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  to: (room: string) => { emit: (event: string, ...args: unknown[]) => void };
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  rooms: Set<string>;
};

const userRooms = new Map<string, string>();
const playerIds = new Map<string, string>();

export function setupSocketHandlers(socket: SocketType) {
  const client = socket as unknown as ClientToServerEvents;

  client.create_room = (data, callback) => {
    const result = gameManager.createRoom(data.name);
    callback({
      success: result.success,
      room: result.room,
      error: result.error,
    });
  };

  client.join_room = (data, callback) => {
    const result = gameManager.joinRoom(data.roomId, data.playerId, data.playerName);
    playerIds.set(socket.id, data.playerId);
    
    if (!result.success) {
      callback({ success: false, error: result.error });
      return;
    }

    const room = gameManager.getRoom(data.roomId);
    if (!room) {
      callback({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    userRooms.set(socket.id, data.roomId);
    socket.join(data.roomId);

    callback({
      success: true,
      room: room.toInfo(),
      players: room.getPlayersInfo(),
      shops: room.getShopsInfo(),
    });

    socket.to(data.roomId).emit('player_joined', room.getPlayer(data.playerId)?.toInfo());
  };

  client.leave_room = (data, callback) => {
    const roomId = userRooms.get(socket.id);
    const playerId = playerIds.get(socket.id);
    if (roomId && playerId) {
      gameManager.leaveRoom(roomId, playerId);
      userRooms.delete(socket.id);
      playerIds.delete(socket.id);
      socket.leave(roomId);
      socket.to(roomId).emit('player_left', playerId);
    }
    callback();
  };

  client.get_rooms = (callback) => {
    callback(gameManager.getRooms());
  };

  client.create_shop = (data, callback) => {
    const roomId = userRooms.get(socket.id);
    const playerId = playerIds.get(socket.id);
    if (!roomId || roomId !== data.roomId) {
      callback({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    if (!playerId) {
      callback({ success: false, error: 'PLAYER_NOT_FOUND' });
      return;
    }

    const result = gameManager.createShop(data.roomId, data.name, playerId);
    if (result.success) {
      socket.to(roomId).emit('shop_created', result.shop);
    }
    callback({
      success: result.success,
      shop: result.shop,
      error: result.error,
    });
  };

  client.get_shops = (data, callback) => {
    callback(gameManager.getShops(data.roomId));
  };

  client.get_shop_status = (data, callback) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) {
      callback({ shop: null as never, items: [] });
      return;
    }

    const shop = gameManager.getShop(roomId, data.shopId);
    if (!shop) {
      callback({ shop: null as never, items: [] });
      return;
    }

    callback({
      shop: shop.toInfo(),
      items: shop.getItemsInfo(),
    });
  };

  client.buy_item = (data, callback) => {
    const roomId = userRooms.get(socket.id);
    const playerId = playerIds.get(socket.id);
    if (!roomId || !playerId) {
      callback({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    const result = gameManager.buyItem(roomId, data.shopId, playerId, data.itemId, data.quantity);
    
    if (result.success) {
      const shop = gameManager.getShop(roomId, data.shopId);
      if (shop) {
        socket.to(roomId).emit('shop_updated', shop.toInfo());
      }
    }

    callback(result);
  };

  client.sell_item = (data, callback) => {
    const roomId = userRooms.get(socket.id);
    const playerId = playerIds.get(socket.id);
    if (!roomId || !playerId) {
      callback({ success: false, error: 'ROOM_NOT_FOUND' });
      return;
    }

    const result = gameManager.sellItem(roomId, data.shopId, playerId, data.itemId, data.quantity);
    callback(result);
  };

  client.get_inventory = (callback) => {
    const playerId = playerIds.get(socket.id);
    if (!playerId) {
      const emptyInventory: InventoryInfo = { coins: 0, items: [] };
      callback(emptyInventory);
      return;
    }

    const player = gameManager.getPlayer(playerId);
    if (!player) {
      const emptyInventory: InventoryInfo = { coins: 0, items: [] };
      callback(emptyInventory);
      return;
    }

    callback(player.toInventoryInfo());
  };

  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    const playerId = playerIds.get(socket.id);
    if (roomId && playerId) {
      gameManager.leaveRoom(roomId, playerId);
      socket.to(roomId).emit('player_left', playerId);
      userRooms.delete(socket.id);
      playerIds.delete(socket.id);
    }
  });
}
