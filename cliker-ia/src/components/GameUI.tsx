/**
 * GameUI - Componente principal del juego
 * 
 * Coordina React (lógica) con Phaser (render)
 */

import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGameState';
import { Game, MainScene } from '../game/MainScene';
import type { UIBackend } from '../game/MainScene';
import { stateToRenderData } from '../game/gameApi';
import './GameUI.css';

export function GameUI() {
  const { 
    handleClick, 
    handleBuyUpgrade, 
    gameState,
    isLoaded 
  } = useGame();
  
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MainScene | null>(null);
  const isPhaserReady = useRef(false);
  const [phaserReady, setPhaserReady] = useState(false);

  // Inicializar Phaser UNA SOLA VEZ
  useEffect(() => {
    // Solo iniciar si está cargado y Phaser no está listo
    if (!isLoaded || isPhaserReady.current) return;
    
    const container = document.getElementById('phaser-game');
    if (!container || container.children.length > 0) return;
    
    isPhaserReady.current = true;
    
    console.log('[GameUI] Inicializando Phaser...');
    gameRef.current = new Game('phaser-game');
    
    // Configurar cuando la escena esté lista
    const checkScene = setInterval(() => {
      const scene = gameRef.current?.getMainScene();
      if (scene) {
        clearInterval(checkScene);
        sceneRef.current = scene;
        
        // Configurar backend
        const backend: UIBackend = {
          onClick: () => handleClick(),
          onPurchaseUpgrade: (id: string) => handleBuyUpgrade(id),
          onBuyFromShop: () => {},
        };
        scene.setUIBackend(backend);
        
        // Hacer primer render
        const data = stateToRenderData(gameState);
        scene.render(data);
        
        setPhaserReady(true);
        console.log('[GameUI] Phaser listo');
      }
    }, 100);
    
    // Cleanup
    return () => {
      clearInterval(checkScene);
      // No destruir Phaser al desmontar para evitar parpadeo
    };
  }, [isLoaded]);

  // Actualizar Phaser cuando cambia el estado
  useEffect(() => {
    if (!phaserReady || !sceneRef.current) return;
    
    const data = stateToRenderData(gameState);
    sceneRef.current.render(data);
  }, [gameState, phaserReady]);

  if (!isLoaded) {
    return (
      <div className="game-wrapper">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div id="phaser-game" />
    </div>
  );
}
