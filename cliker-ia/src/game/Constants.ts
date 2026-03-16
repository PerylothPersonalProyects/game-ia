/**
 * Constantes visuales del juego
 * 
 * Aquí se definen todos los valores de diseño visual:
 * - Colores
 * - Tamaños
 * - Efectos
 * - Configuraciones de partículas
 */

export const COLORS = {
  // Background
  BG_DARK: '#0d0d1a',
  BG_LIGHT: '#1a1a2e',
  BG_GRADIENT_START: '#0f0f23',
  BG_GRADIENT_END: '#1a1a2e',
  
  // Panels
  PANEL_BG: '#16213e',
  PANEL_BORDER: '#2a3a5a',
  PANEL_ROW_ALT: '#1f1f3a',
  PANEL_HOVER: '#2a3a5a',
  
  // Primary accent (gold/coins)
  GOLD: '#ffd700',
  GOLD_DARK: '#cc9900',
  GOLD_LIGHT: '#ffed4a',
  
  // Secondary accent (turquoise)
  ACCENT: '#4ecdc4',
  ACCENT_DARK: '#3ba99c',
  ACCENT_LIGHT: '#7eddd6',
  
  // Text
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#8899aa',
  TEXT_INACTIVE: '#555566',
  
  // Status
  SUCCESS: '#4ade80',
  WARNING: '#fbbf24',
  ERROR: '#ef4444',
};

export const SIZES = {
  // Game
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  
  // Click button
  CLICK_BUTTON_RADIUS: 60,
  CLICK_BUTTON_BORDER: 4,
  
  // Panel upgrades
  PANEL_WIDTH: 320,
  PANEL_ROW_HEIGHT: 32,
  PANEL_PADDING: 12,
  PANEL_BORDER_RADIUS: 8,
  
  // Fonts
  FONT_TITLE: '24px',
  FONT_SUBTITLE: '18px',
  FONT_BODY: '14px',
  FONT_SMALL: '12px',
  FONT_COINS: 'bold 20px',
};

export const EFFECTS = {
  // Click feedback
  CLICK_SCALE_DOWN: 0.9,
  CLICK_SCALE_UP: 1.0,
  CLICK_DURATION: 100,
  
  // Screen shake
  SHAKE_DURATION: 100,
  SHAKE_INTENSITY: 0.005,
  
  // Particles
  CLICK_PARTICLE_COUNT: 8,
  CLICK_PARTICLE_SPEED: 150,
  CLICK_PARTICLE_LIFESPAN: 500,
  
  // Background particles
  BG_PARTICLE_COUNT: 20,
  BG_PARTICLE_SPEED: 30,
  BG_PARTICLE_LIFESPAN: 3000,
  
  // Glow effect
  GLOW_ALPHA: 0.3,
  GLOW_BLUR: 10,
};

export const ANIMATIONS = {
  // Entrance
  ENTRANCE_DURATION: 500,
  ENTRANCE_EASE: 'Back.easeOut',
  
  // Hover
  HOVER_DURATION: 150,
  
  // Purchase
  PURCHASE_FLASH_DURATION: 200,
  
  // Floating text
  FLOAT_TEXT_DURATION: 1000,
  FLOAT_TEXT_OFFSET_Y: -50,
};

export const UPGRADES_PANEL = {
  X: 450,
  Y: 80,
  WIDTH: 320,
  HEIGHT: 400,
};

export const STATS_PANEL = {
  X: 50,
  Y: 80,
  WIDTH: 280,
  HEIGHT: 150,
};

export const CLICK_BUTTON = {
  X: 400,
  Y: 350,
  RADIUS: 60,
};
