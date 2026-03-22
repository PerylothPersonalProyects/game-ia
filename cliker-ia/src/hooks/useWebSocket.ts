import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export interface GameStateWS {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: any[];
  shopUpgrades?: any[];
  offlineEarned?: number;
  lastUpdate: number;
  earned?: number;
  passiveEarned?: number;
  clickEarned?: number;
  upgradeData?: any;
}

interface UseWebSocketOptions {
  playerId: string;
  onStateUpdate?: (state: GameStateWS) => void;
  onError?: (error: string) => void;
}

export function useWebSocket({ playerId, onStateUpdate, onError }: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Connect on mount
  useEffect(() => {
    if (!playerId) return;
    
    console.log('[WS Hook] Connecting to:', WS_URL);
    
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    // Connection events
    socket.on('connect', () => {
      console.log('[WS Hook] Connected:', socket.id);
      setIsConnected(true);
      
      // Join the game
      socket.emit('join', { playerId }, (response: any) => {
        console.log('[WS Hook] Join response:', response);
        if (response.success) {
          setHasJoined(true);
          onStateUpdate?.(response.state);
        } else {
          console.error('[WS Hook] Join failed:', response.error);
          onError?.(response.error || 'Failed to join');
        }
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[WS Hook] Disconnected:', reason);
      setIsConnected(false);
      setHasJoined(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[WS Hook] Connection error:', error);
      onError?.(error.message);
    });
    
    // Game state updates
    socket.on('state', (state: GameStateWS) => {
      console.log('[WS Hook] State update:', state);
      onStateUpdate?.(state);
    });
    
    // Passive income sync
    socket.on('sync', (state: GameStateWS) => {
      console.log('[WS Hook] Sync (passive):', state);
      onStateUpdate?.(state);
    });
    
    // Error handling
    socket.on('error', (error: { message: string }) => {
      console.error('[WS Hook] Server error:', error);
      onError?.(error.message);
    });
    
    return () => {
      console.log('[WS Hook] Cleaning up...');
      socket.emit('leave', { playerId });
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setHasJoined(false);
    };
  }, [playerId]);
  
  // Click action
  const click = useCallback(() => {
    if (!socketRef.current || !hasJoined) {
      console.warn('[WS Hook] Cannot click - not connected');
      return;
    }
    
    console.log('[WS Hook] Emitting click');
    socketRef.current.emit('click', { playerId }, (response: any) => {
      if (!response.success) {
        console.error('[WS Hook] Click failed:', response.error);
        onError?.(response.error);
      }
    });
  }, [playerId, hasJoined]);
  
  // Buy upgrade action
  const buy = useCallback((upgradeId: string) => {
    if (!socketRef.current || !hasJoined) {
      console.warn('[WS Hook] Cannot buy - not connected');
      return;
    }
    
    console.log('[WS Hook] Emitting buy:', upgradeId);
    socketRef.current.emit('buy', { playerId, upgradeId }, (response: any) => {
      if (!response.success) {
        console.error('[WS Hook] Buy failed:', response.error);
        onError?.(response.error);
      }
    });
  }, [playerId, hasJoined]);
  
  // Leave game
  const leave = useCallback(() => {
    if (!socketRef.current) return;
    
    console.log('[WS Hook] Emitting leave');
    socketRef.current.emit('leave', { playerId });
    setHasJoined(false);
  }, [playerId]);
  
  return {
    isConnected,
    hasJoined,
    click,
    buy,
    leave,
  };
}
