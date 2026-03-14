export type ItemEffectType = 'click_boost' | 'passive_boost' | 'speed_boost';

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  maxStock: number;
  currentStock: number;
  expiresAt: Date;
  effect: ItemEffect;
}

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  roomId: string;
  items: ShopItem[];
  refreshInterval: number;
  lastRefresh: Date;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  inventory: Map<string, number>;
}

export interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  players: Map<string, Player>;
  shops: Map<string, Shop>;
  createdAt: Date;
}

export interface ServerToClientEvents {
  rooms_list: (rooms: RoomInfo[]) => void;
  room_joined: (data: { room: RoomInfo; players: PlayerInfo[]; shops: ShopInfo[] }) => void;
  player_joined: (player: PlayerInfo) => void;
  player_left: (playerId: string) => void;
  shop_created: (shop: ShopInfo) => void;
  shops_list: (shops: ShopInfo[]) => void;
  shop_status: (data: { shop: ShopInfo; items: ShopItemInfo[] }) => void;
  shop_updated: (shop: ShopInfo) => void;
  inventory_updated: (inventory: InventoryInfo) => void;
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { name: string }, callback: (response: CreateRoomResponse) => void) => void;
  join_room: (data: { roomId: string; playerId: string; playerName: string }, callback: (response: JoinRoomResponse) => void) => void;
  leave_room: (data: { roomId: string }, callback: () => void) => void;
  get_rooms: (callback: (rooms: RoomInfo[]) => void) => void;
  create_shop: (data: { roomId: string; name: string }, callback: (response: CreateShopResponse) => void) => void;
  get_shops: (data: { roomId: string }, callback: (shops: ShopInfo[]) => void) => void;
  get_shop_status: (data: { shopId: string }, callback: (data: { shop: ShopInfo; items: ShopItemInfo[] }) => void) => void;
  buy_item: (data: { shopId: string; itemId: string; quantity: number }, callback: (response: TradeResponse) => void) => void;
  sell_item: (data: { shopId: string; itemId: string; quantity: number }, callback: (response: TradeResponse) => void) => void;
  get_inventory: (callback: (inventory: InventoryInfo) => void, data?: { playerId?: string }) => void;
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  shopCount: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  coins: number;
}

export interface ShopInfo {
  id: string;
  name: string;
  ownerId: string;
  itemCount: number;
}

export interface ShopItemInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  currentStock: number;
  maxStock: number;
  expiresIn: number;
}

export interface InventoryInfo {
  coins: number;
  items: { id: string; quantity: number }[];
}

export interface CreateRoomResponse {
  success: boolean;
  room?: RoomInfo;
  error?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: RoomInfo;
  players?: PlayerInfo[];
  shops?: ShopInfo[];
  error?: string;
}

export interface CreateShopResponse {
  success: boolean;
  shop?: ShopInfo;
  error?: string;
}

export interface TradeResponse {
  success: boolean;
  error?: string;
  coins?: number;
}

export type ErrorCode =
  | 'ROOM_FULL'
  | 'ROOM_NOT_FOUND'
  | 'MAX_ROOMS_REACHED'
  | 'MAX_SHOPS_REACHED'
  | 'MAX_SHOPS_PER_ROOM'
  | 'INSUFFICIENT_COINS'
  | 'OUT_OF_STOCK'
  | 'ITEM_EXPIRED'
  | 'NOT_ENOUGH_ITEMS'
  | 'PLAYER_NOT_FOUND'
  | 'SHOP_NOT_FOUND'
  | 'ITEM_NOT_FOUND';
