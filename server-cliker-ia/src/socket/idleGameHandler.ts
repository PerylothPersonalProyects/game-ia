import type { Server, Socket } from 'socket.io';
import { idleGameService } from '../services/IdleGameService.js';

type SocketType = {
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
};

const playerSockets = new Map<string, string>(); // playerId -> socketId
const socketPlayers = new Map<string, string>(); // socketId -> playerId
const playerIntervals = new Map<string, NodeJS.Timeout>(); // playerId -> interval

// Clean up interval on disconnect
function cleanupPlayer(playerId: string) {
  const interval = playerIntervals.get(playerId);
  if (interval) {
    clearInterval(interval);
    playerIntervals.delete(playerId);
  }
  playerSockets.delete(playerId);
}

export function setupIdleGameHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[WS Idle] Client connected: ${socket.id}`);
    
    // Event: join - Player joins the idle game
    socket.on('join', async (data: { playerId: string }, callback?: (response: unknown) => void) => {
      const playerId = data.playerId;
      console.log(`[WS Idle] Player joining: ${playerId}`);
      
      try {
        // Get or create player
        const player = await idleGameService.getOrCreatePlayer(playerId);
        
        // Clean up previous socket if exists
        const existingSocketId = playerSockets.get(playerId);
        if (existingSocketId) {
          cleanupPlayer(playerId);
        }
        
        // Track player-socket mapping
        playerSockets.set(playerId, socket.id);
        socketPlayers.set(socket.id, playerId);
        
        // Calculate offline earnings
        const offlineProgress = await idleGameService.calculateOfflineProgress(playerId);
        
        // Send current state to player
        const state = {
          coins: player.coins,
          coinsPerClick: player.coinsPerClick,
          coinsPerSecond: player.coinsPerSecond,
          upgrades: player.upgrades,
          shopUpgrades: player.shopUpgrades,
          offlineEarned: offlineProgress.earned,
          lastUpdate: Date.now(),
        };
        
        socket.emit('state', state);
        
        // Start passive income sync (every second)
        const interval = setInterval(async () => {
          try {
            const currentPlayer = await idleGameService.getOrCreatePlayer(playerId);
            const now = Date.now();
            const secondsSinceLastAction = Math.max(0, Math.floor((now - currentPlayer.lastUpdate) / 1000));
            const passiveEarned = currentPlayer.coinsPerSecond * secondsSinceLastAction;
            
            // Only sync if there's passive income
            if (passiveEarned > 0) {
              // Add passive earnings only (NOT click - that would double-count!)
              await idleGameService.addPassiveIncome(playerId);
              
              // Get updated state
              const updatedPlayer = await idleGameService.getOrCreatePlayer(playerId);
              
              // Emit to the player's room
              socket.emit('sync', {
                coins: updatedPlayer.coins,
                coinsPerClick: updatedPlayer.coinsPerClick,
                coinsPerSecond: updatedPlayer.coinsPerSecond,
                passiveEarned: passiveEarned,
                lastUpdate: Date.now(),
              });
            }
          } catch (error) {
            console.error(`[WS Idle] Sync error for ${playerId}:`, error);
          }
        }, 1000); // Every 1 second
        
        playerIntervals.set(playerId, interval);
        
        if (callback) {
          callback({ success: true, state });
        }
      } catch (error) {
        console.error(`[WS Idle] Join error for ${playerId}:`, error);
        if (callback) {
          callback({ success: false, error: 'Failed to join game' });
        }
      }
    });
    
    // Event: click - Player clicks
    socket.on('click', async (data: { playerId: string }, callback?: (response: unknown) => void) => {
      const playerId = data?.playerId || socketPlayers.get(socket.id);
      
      if (!playerId) {
        if (callback) callback({ success: false, error: 'Not joined' });
        return;
      }
      
      try {
        const result = await idleGameService.processClick(playerId);
        
        // Emit updated state
        socket.emit('state', {
          coins: result.player.coins,
          coinsPerClick: result.player.coinsPerClick,
          coinsPerSecond: result.player.coinsPerSecond,
          upgrades: result.player.upgrades,
          lastUpdate: Date.now(),
          earned: result.earned,
          passiveEarned: result.passiveEarned,
          clickEarned: result.clickEarned,
        });
        
        if (callback) {
          callback({
            success: true,
            coins: result.player.coins,
            earned: result.earned,
            passiveEarned: result.passiveEarned,
            clickEarned: result.clickEarned,
          });
        }
      } catch (error) {
        console.error(`[WS Idle] Click error for ${playerId}:`, error);
        if (callback) {
          callback({ success: false, error: 'Click failed' });
        }
      }
    });
    
    // Event: buy - Player buys an upgrade
    socket.on('buy', async (data: { playerId: string; upgradeId: string }, callback?: (response: unknown) => void) => {
      const playerId = data?.playerId || socketPlayers.get(socket.id);
      
      if (!playerId) {
        if (callback) callback({ success: false, error: 'Not joined' });
        return;
      }
      
      try {
        const result = await idleGameService.buyUpgrade(playerId, data.upgradeId);
        
        if (!result.success || !result.player) {
          if (callback) {
            callback({ success: false, error: result.error || 'Purchase failed' });
          }
          return;
        }
        
        const player = result.player;
        
        // Emit updated state
        socket.emit('state', {
          coins: player.coins,
          coinsPerClick: player.coinsPerClick,
          coinsPerSecond: player.coinsPerSecond,
          upgrades: player.upgrades,
          shopUpgrades: player.shopUpgrades,
          lastUpdate: Date.now(),
          upgradeData: result.upgrade,
        });
        
        if (callback) {
          callback({
            success: true,
            coins: player.coins,
            upgrade: result.upgrade,
          });
        }
      } catch (error) {
        console.error(`[WS Idle] Buy error for ${playerId}:`, error);
        if (callback) {
          callback({ success: false, error: 'Purchase failed' });
        }
      }
    });
    
    // Event: leave - Player leaves
    socket.on('leave', (data: { playerId: string }, callback?: () => void) => {
      const playerId = data?.playerId;
      
      if (playerId) {
        cleanupPlayer(playerId);
        socketPlayers.delete(socket.id);
        console.log(`[WS Idle] Player left: ${playerId}`);
      }
      
      if (callback) callback();
    });
    
    // Event: disconnect
    socket.on('disconnect', () => {
      const playerId = socketPlayers.get(socket.id);
      if (playerId) {
        cleanupPlayer(playerId);
        socketPlayers.delete(socket.id);
        console.log(`[WS Idle] Client disconnected: ${socket.id} (player: ${playerId})`);
      } else {
        console.log(`[WS Idle] Client disconnected: ${socket.id}`);
      }
    });
  });
}
