/**
 * UpgradesTable - Tabla de mejoras en React
 * 
 * Muestra las mejoras disponibles en el shop con su nivel, costo y botón de comprar
 */

import { useGameContext } from '../store/GameContext';
import type { Upgrade } from '../types';
import './UpgradesTable.css';

// Format number with K, M, B suffixes
function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function UpgradesTable() {
  const { gameState, handleBuyUpgrade } = useGameContext();
  
  const { coins, shopUpgrades, upgrades } = gameState;
  
  // Obtener mejoras para mostrar (priorizar shopUpgrades)
  const displayUpgrades = shopUpgrades && shopUpgrades.length > 0 
    ? shopUpgrades 
    : upgrades;
  
  const handlePurchase = (upgradeId: string) => {
    console.log('[UpgradesTable] Comprando:', upgradeId);
    handleBuyUpgrade(upgradeId);
  };
  
  if (!displayUpgrades || displayUpgrades.length === 0) {
    return (
      <div className="upgrades-container">
        <div className="upgrades-header">
          <h2>MEJORAS</h2>
        </div>
        <div className="upgrades-empty">
          <p>No hay mejoras disponibles</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="upgrades-container">
      <div className="upgrades-header">
        <h2>MEJORAS</h2>
      </div>
      
      <div className="upgrades-table">
        <div className="upgrades-row header">
          <div className="col-name">MEJORA</div>
          <div className="col-level">NIVEL</div>
          <div className="col-cost">PRECIO</div>
          <div className="col-buy">COMPRAR</div>
        </div>
        
        {displayUpgrades.map((upgrade: Upgrade) => {
          const canAfford = coins >= upgrade.cost && upgrade.purchased < upgrade.maxLevel;
          const isMaxed = upgrade.purchased >= upgrade.maxLevel;
          
          return (
            <div 
              key={upgrade.id} 
              className={`upgrades-row ${canAfford ? 'affordable' : ''} ${isMaxed ? 'maxed' : ''}`}
            >
              <div className="col-name">
                <span className={`upgrade-icon ${upgrade.type}`}>
                  {upgrade.type === 'click' ? '⚡' : '⏰'}
                </span>
                <span className="upgrade-name">{upgrade.name}</span>
              </div>
              
              <div className={`col-level ${isMaxed ? 'maxed' : ''}`}>
                {upgrade.purchased}/{upgrade.maxLevel}
              </div>
              
              <div className={`col-cost ${canAfford ? 'affordable' : ''}`}>
                {formatNumber(upgrade.cost)}
              </div>
              
              <div className="col-buy">
                <button
                  className={`buy-btn ${canAfford ? 'can-buy' : ''} ${isMaxed ? 'maxed' : ''}`}
                  onClick={() => handlePurchase(upgrade.id)}
                  disabled={!canAfford && !isMaxed}
                >
                  {isMaxed ? 'MAX' : canAfford ? '✓' : '✕'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
