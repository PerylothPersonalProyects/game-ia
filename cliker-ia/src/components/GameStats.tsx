/**
 * GameStats - Panel de estadísticas del juego en React
 * 
 * Muestra: monedas, monedas por click, monedas por segundo
 */

import { useGameContext } from '../store/GameContext';
import './GameStats.css';

// Format number with K, M, B suffixes
function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

export function GameStats() {
  const { gameState } = useGameContext();
  
  const { coins, coinsPerClick, coinsPerSecond } = gameState;
  
  console.log('[GameStats] Rendering - coins:', coins, 'cps:', coinsPerSecond, 'cpc:', coinsPerClick);
  
  return (
    <div className="game-stats">
      {/* Coins counter */}
      <div className="coins-display">
        <span className="coin-icon">💰</span>
        <span className="coin-amount">{formatNumber(coins)}</span>
      </div>
      
      {/* CPS and CPC */}
      <div className="stats-row">
        <div className="stat-item cps">
          <span className="stat-icon">⏰</span>
          <span className="stat-value">{formatNumber(coinsPerSecond)}</span>
          <span className="stat-label">/ seg</span>
        </div>
        
        <div className="stat-divider" />
        
        <div className="stat-item cpc">
          <span className="stat-icon">⚡</span>
          <span className="stat-value">{formatNumber(coinsPerClick)}</span>
          <span className="stat-label">/ click</span>
        </div>
      </div>
    </div>
  );
}
