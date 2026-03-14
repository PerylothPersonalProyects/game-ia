import { useEffect, useState, useCallback, useRef } from 'react';
import { socketClient } from './socketClient';
import type {
  RoomInfo,
  PlayerInfo,
  ShopInfo,
  ShopItemInfo,
  InventoryInfo,
  CreateRoomResponse,
  JoinRoomResponse,
  CreateShopResponse,
  TradeResponse,
} from './types';

export interface UseSocketReturn {
  isConnected: boolean;
  currentRoom: RoomInfo | null;
  players: PlayerInfo[];
  shops: ShopInfo[];
  inventory: InventoryInfo | null;
  error: string | null;
  createRoom: (name: string) => Promise<CreateRoomResponse>;
  joinRoom: (roomId: string, playerId: string, playerName: string) => Promise<JoinRoomResponse>;
  leaveRoom: () => Promise<void>;
  getRooms: () => Promise<RoomInfo[]>;
  createShop: (name: string) => Promise<CreateShopResponse>;
  getShops: () => Promise<ShopInfo[]>;
  getShopStatus: (shopId: string) => Promise<{ shop: ShopInfo; items: ShopItemInfo[] } | null>;
  buyItem: (shopId: string, itemId: string, quantity: number) => Promise<TradeResponse>;
  sellItem: (shopId: string, itemId: string, quantity: number) => Promise<TradeResponse>;
  refreshInventory: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [shops, setShops] = useState<ShopInfo[]>([]);
  const [inventory, setInventory] = useState<InventoryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);

  useEffect(() => {
    socketClient.connect();
    setIsConnected(socketClient.isConnected());

    const unsubConnect = socketClient.on('connect', () => {
      setIsConnected(true);
    });

    const unsubDisconnect = socketClient.on('disconnect', () => {
      setIsConnected(false);
    });

    const unsubRoomJoined = socketClient.on('room_joined', (data: unknown) => {
      const roomData = data as { room: RoomInfo; players: PlayerInfo[]; shops: ShopInfo[] };
      setCurrentRoom(roomData.room);
      setPlayers(roomData.players);
      setShops(roomData.shops);
      roomIdRef.current = roomData.room.id;
    });

    const unsubPlayerJoined = socketClient.on('player_joined', (data: unknown) => {
      const player = data as PlayerInfo;
      setPlayers((prev) => [...prev.filter((p) => p.id !== player.id), player]);
    });

    const unsubPlayerLeft = socketClient.on('player_left', (data: unknown) => {
      const playerId = data as string;
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });

    const unsubShopCreated = socketClient.on('shop_created', (data: unknown) => {
      const shop = data as ShopInfo;
      setShops((prev) => [...prev.filter((s) => s.id !== shop.id), shop]);
    });

    const unsubShopUpdated = socketClient.on('shop_updated', (data: unknown) => {
      const shop = data as ShopInfo;
      setShops((prev) => prev.map((s) => (s.id === shop.id ? shop : s)));
    });

    const unsubInventoryUpdated = socketClient.on('inventory_updated', (data: unknown) => {
      const inv = data as InventoryInfo;
      setInventory(inv);
    });

    const unsubError = socketClient.on('error', (data: unknown) => {
      const err = data as { code: string; message: string };
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubRoomJoined();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubShopCreated();
      unsubShopUpdated();
      unsubInventoryUpdated();
      unsubError();
    };
  }, []);

  const createRoom = useCallback(async (name: string): Promise<CreateRoomResponse> => {
    const response = await socketClient.createRoom(name);
    return response as CreateRoomResponse;
  }, []);

  const joinRoom = useCallback(
    async (roomId: string, playerId: string, playerName: string): Promise<JoinRoomResponse> => {
      const response = await socketClient.joinRoom(roomId, playerId, playerName);
      roomIdRef.current = roomId;
      return response as JoinRoomResponse;
    },
    []
  );

  const leaveRoom = useCallback(async (): Promise<void> => {
    if (roomIdRef.current) {
      await socketClient.leaveRoom(roomIdRef.current);
      setCurrentRoom(null);
      setPlayers([]);
      setShops([]);
      roomIdRef.current = null;
    }
  }, []);

  const getRooms = useCallback(async (): Promise<RoomInfo[]> => {
    const response = await socketClient.getRooms();
    return response as RoomInfo[];
  }, []);

  const createShop = useCallback(
    async (name: string): Promise<CreateShopResponse> => {
      if (!roomIdRef.current) {
        return { success: false, error: 'Not in a room' };
      }
      const response = await socketClient.createShop(roomIdRef.current, name);
      return response as CreateShopResponse;
    },
    []
  );

  const getShops = useCallback(async (): Promise<ShopInfo[]> => {
    if (!roomIdRef.current) return [];
    const response = await socketClient.getShops(roomIdRef.current);
    return response as ShopInfo[];
  }, []);

  const getShopStatus = useCallback(
    async (shopId: string): Promise<{ shop: ShopInfo; items: ShopItemInfo[] } | null> => {
      const response = await socketClient.getShopStatus(shopId);
      return response as { shop: ShopInfo; items: ShopItemInfo[] } | null;
    },
    []
  );

  const buyItem = useCallback(
    async (shopId: string, itemId: string, quantity: number): Promise<TradeResponse> => {
      const response = await socketClient.buyItem(shopId, itemId, quantity);
      if ((response as TradeResponse).success) {
        await socketClient.getInventory().then((inv) => {
          setInventory(inv as InventoryInfo);
        });
      }
      return response as TradeResponse;
    },
    []
  );

  const sellItem = useCallback(
    async (shopId: string, itemId: string, quantity: number): Promise<TradeResponse> => {
      const response = await socketClient.sellItem(shopId, itemId, quantity);
      if ((response as TradeResponse).success) {
        await socketClient.getInventory().then((inv) => {
          setInventory(inv as InventoryInfo);
        });
      }
      return response as TradeResponse;
    },
    []
  );

  const refreshInventory = useCallback(async (): Promise<void> => {
    const response = await socketClient.getInventory();
    setInventory(response as InventoryInfo);
  }, []);

  const connect = useCallback(() => {
    socketClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, []);

  return {
    isConnected,
    currentRoom,
    players,
    shops,
    inventory,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRooms,
    createShop,
    getShops,
    getShopStatus,
    buyItem,
    sellItem,
    refreshInventory,
    connect,
    disconnect,
  };
}
