import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// INTERFACES
// ============================================

export interface IUpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  type: 'click' | 'passive';
  enabled: boolean;
}

export interface IUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  purchased: number;
}

export interface IPlayer extends Document {
  playerId: string;
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: IUpgrade[];
  lastUpdate: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMAS
// ============================================

const UpgradeConfigSchema = new Schema<IUpgradeConfig>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  baseCost: { type: Number, required: true },
  costMultiplier: { type: Number, required: true },
  effect: { type: Number, required: true },
  maxLevel: { type: Number, required: true },
  type: { type: String, enum: ['click', 'passive'], required: true },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

const UpgradeSchema = new Schema<IUpgrade>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  costMultiplier: { type: Number, required: true },
  effect: { type: Number, required: true },
  maxLevel: { type: Number, required: true },
  purchased: { type: Number, default: 0 },
}, { _id: false });

const PlayerSchema = new Schema<IPlayer>({
  playerId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  coins: { type: Number, default: 0 },
  coinsPerClick: { type: Number, default: 1 },
  coinsPerSecond: { type: Number, default: 0 },
  upgrades: [UpgradeSchema],
  lastUpdate: { type: Number, default: Date.now },
}, {
  timestamps: true,
});

// ============================================
// EXPORTS
// ============================================

export const UpgradeConfigModel = mongoose.model<IUpgradeConfig>('UpgradeConfig', UpgradeConfigSchema);
export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);

// ============================================
// SEED DEFAULT UPGRADES
// ============================================

export async function seedDefaultUpgrades(): Promise<void> {
  const DEFAULT_UPGRADES = [
    // Click upgrades
    {
      id: 'click_1',
      name: 'Dedo Rápido',
      description: 'Mejora tu dedo para hacer clicks más rápidos',
      baseCost: 10,
      costMultiplier: 1.5,
      effect: 1,
      maxLevel: 100,
      type: 'click',
      enabled: true,
    },
    {
      id: 'click_2',
      name: 'Mano Firme',
      description: 'Tu mano es más precisa y fuerte',
      baseCost: 100,
      costMultiplier: 1.6,
      effect: 5,
      maxLevel: 50,
      type: 'click',
      enabled: true,
    },
    {
      id: 'click_3',
      name: 'Poder Digital',
      description: 'Tus dedos tienen poder sobrenatural',
      baseCost: 1000,
      costMultiplier: 1.7,
      effect: 25,
      maxLevel: 25,
      type: 'click',
      enabled: true,
    },
    // Passive upgrades
    {
      id: 'passive_1',
      name: 'Inversor Novato',
      description: 'Empieza a ganar dinero automáticamente',
      baseCost: 50,
      costMultiplier: 1.5,
      effect: 1,
      maxLevel: 100,
      type: 'passive',
      enabled: true,
    },
    {
      id: 'passive_2',
      name: 'Emprendedor',
      description: 'Tus inversiones generan más ganancias',
      baseCost: 500,
      costMultiplier: 1.6,
      effect: 5,
      maxLevel: 50,
      type: 'passive',
      enabled: true,
    },
    {
      id: 'passive_3',
      name: 'Magnate',
      description: 'Construye un imperio financiero',
      baseCost: 5000,
      costMultiplier: 1.7,
      effect: 25,
      maxLevel: 25,
      type: 'passive',
      enabled: true,
    },
  ];

  for (const upgrade of DEFAULT_UPGRADES) {
    await UpgradeConfigModel.findOneAndUpdate(
      { id: upgrade.id },
      upgrade,
      { upsert: true, new: true }
    );
  }
  console.log('Default upgrades seeded');
}
