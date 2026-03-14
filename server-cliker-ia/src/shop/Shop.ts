import type { Shop as ShopType, ShopItem, ShopItemInfo, ItemEffect, ShopInfo } from '../types/index.js';

const DEFAULT_ITEM_TEMPLATES: Omit<ShopItem, 'id' | 'expiresAt'>[] = [
  { name: 'Clicker +10', description: '+10 monedas por click', price: 100, maxStock: 7, currentStock: 7, effect: { type: 'click_boost', value: 10 } },
  { name: 'Clicker +25', description: '+25 monedas por click', price: 250, maxStock: 5, currentStock: 5, effect: { type: 'click_boost', value: 25 } },
  { name: 'Clicker +50', description: '+50 monedas por click', price: 500, maxStock: 3, currentStock: 3, effect: { type: 'click_boost', value: 50 } },
  { name: 'Aura Pasiva +1', description: '+1 moneda por segundo', price: 150, maxStock: 10, currentStock: 10, effect: { type: 'passive_boost', value: 1 } },
  { name: 'Aura Pasiva +5', description: '+5 monedas por segundo', price: 500, maxStock: 5, currentStock: 5, effect: { type: 'passive_boost', value: 5 } },
  { name: 'Aura Pasiva +10', description: '+10 monedas por segundo', price: 1000, maxStock: 3, currentStock: 3, effect: { type: 'passive_boost', value: 10 } },
  { name: 'Speed Boost', description: '2x velocidad por 30 min', price: 300, maxStock: 5, currentStock: 5, effect: { type: 'speed_boost', value: 2, duration: 1800000 } },
];

const DEFAULT_REFRESH_INTERVAL = 60 * 60 * 1000;

let itemIdCounter = 0;

function generateItemId(): string {
  return `item_${++itemIdCounter}_${Date.now()}`;
}

function getRandomItems(count: number): ShopItem[] {
  const shuffled = [...DEFAULT_ITEM_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  const now = new Date();
  
  return selected.map((template) => ({
    ...template,
    id: generateItemId(),
    currentStock: template.maxStock,
    expiresAt: new Date(now.getTime() + DEFAULT_REFRESH_INTERVAL),
  }));
}

export class Shop implements ShopType {
  id: string;
  name: string;
  ownerId: string;
  roomId: string;
  items: ShopItem[];
  refreshInterval: number;
  lastRefresh: Date;
  private refreshTimer?: NodeJS.Timeout;

  constructor(id: string, name: string, ownerId: string, roomId: string) {
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
    this.roomId = roomId;
    this.items = getRandomItems(3 + Math.floor(Math.random() * 3));
    this.refreshInterval = DEFAULT_REFRESH_INTERVAL;
    this.lastRefresh = new Date();
    this.startRefreshTimer();
  }

  private startRefreshTimer(): void {
    this.refreshTimer = setInterval(() => {
      this.refreshItems();
    }, this.refreshInterval);
  }

  stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  refreshItems(): void {
    this.items = getRandomItems(3 + Math.floor(Math.random() * 3));
    this.lastRefresh = new Date();
  }

  buyItem(itemId: string, quantity: number = 1): { success: boolean; error?: string } {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, error: 'ITEM_NOT_FOUND' };
    }

    if (new Date() > item.expiresAt) {
      return { success: false, error: 'ITEM_EXPIRED' };
    }

    if (item.currentStock < quantity) {
      return { success: false, error: 'OUT_OF_STOCK' };
    }

    item.currentStock -= quantity;
    return { success: true };
  }

  sellItem(itemId: string, quantity: number = 1): { success: boolean; error?: string; sellPrice?: number } {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, error: 'ITEM_NOT_FOUND' };
    }

    const sellPrice = Math.floor(item.price * 0.5);
    return { success: true, sellPrice };
  }

  getItem(itemId: string): ShopItem | undefined {
    return this.items.find((i) => i.id === itemId);
  }

  getItemsInfo(): ShopItemInfo[] {
    const now = new Date();
    return this.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      currentStock: item.currentStock,
      maxStock: item.maxStock,
      expiresIn: Math.max(0, item.expiresAt.getTime() - now.getTime()),
    }));
  }

  toInfo(): ShopInfo {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      itemCount: this.items.length,
    };
  }
}
