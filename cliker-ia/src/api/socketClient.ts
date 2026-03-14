import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from './types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  createRoom(name: string): Promise<{ success: boolean; room?: unknown; error?: string }> {
    return new Promise((resolve) => {
      this.socket?.emit('create_room', { name }, (response) => {
        resolve(response);
      });
    });
  }

  joinRoom(roomId: string, playerId: string, playerName: string): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('join_room', { roomId, playerId, playerName }, (response) => {
        resolve(response);
      });
    });
  }

  leaveRoom(roomId: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket?.emit('leave_room', { roomId }, () => {
        resolve();
      });
    });
  }

  getRooms(): Promise<unknown[]> {
    return new Promise((resolve) => {
      this.socket?.emit('get_rooms', (rooms) => {
        resolve(rooms);
      });
    });
  }

  createShop(roomId: string, name: string): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('create_shop', { roomId, name }, (response) => {
        resolve(response);
      });
    });
  }

  getShops(roomId: string): Promise<unknown[]> {
    return new Promise((resolve) => {
      this.socket?.emit('get_shops', { roomId }, (shops) => {
        resolve(shops);
      });
    });
  }

  getShopStatus(shopId: string): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('get_shop_status', { shopId }, (data) => {
        resolve(data);
      });
    });
  }

  buyItem(shopId: string, itemId: string, quantity: number): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('buy_item', { shopId, itemId, quantity }, (response) => {
        resolve(response);
      });
    });
  }

  sellItem(shopId: string, itemId: string, quantity: number): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('sell_item', { shopId, itemId, quantity }, (response) => {
        resolve(response);
      });
    });
  }

  getInventory(): Promise<unknown> {
    return new Promise((resolve) => {
      this.socket?.emit('get_inventory', (inventory) => {
        resolve(inventory);
      });
    });
  }

  on<T>(event: string, callback: (data: T) => void): () => void {
    this.socket?.on(event as keyof ServerToClientEvents, callback as (data: unknown) => void);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (...args: unknown[]) => void);

    return () => {
      this.socket?.off(event as keyof ServerToClientEvents, callback as (data: unknown) => void);
      this.listeners.get(event)?.delete(callback as never);
    };
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.socket?.off(event as keyof ServerToClientEvents, callback as (data: unknown) => void);
      this.listeners.get(event)?.delete(callback as never);
    } else {
      this.socket?.off(event as keyof ServerToClientEvents);
      this.listeners.delete(event);
    }
  }
}

export const socketClient = new SocketClient();
