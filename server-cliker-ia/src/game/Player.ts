import type { Player as PlayerType, PlayerInfo, InventoryInfo } from '../types/index.js';

export class Player implements PlayerType {
  id: string;
  name: string;
  coins: number;
  inventory: Map<string, number>;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.coins = 1000;
    this.inventory = new Map();
  }

  addCoins(amount: number): void {
    this.coins += amount;
  }

  removeCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  addItem(itemId: string, quantity: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    if (current >= quantity) {
      this.inventory.set(itemId, current - quantity);
      if (current - quantity === 0) {
        this.inventory.delete(itemId);
      }
      return true;
    }
    return false;
  }

  getItemQuantity(itemId: string): number {
    return this.inventory.get(itemId) || 0;
  }

  toInfo(): PlayerInfo {
    return {
      id: this.id,
      name: this.name,
      coins: this.coins,
    };
  }

  toInventoryInfo(): InventoryInfo {
    const items = Array.from(this.inventory.entries()).map(([id, quantity]) => ({
      id,
      quantity,
    }));
    return {
      coins: this.coins,
      items,
    };
  }
}
