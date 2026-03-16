import Phaser from 'phaser';
import type { RenderData } from './gameApi';
import { EFFECTS } from './Constants';

export interface UIBackend {
  onClick: () => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onBuyFromShop: (shopId: string, itemId: string) => void;
}

/**
 * MainScene - Solo se encarga de RENDERIZAR
 * 
 * La lógica de negocio está en React (store)
 * Phaser solo muestra lo que React le pasa
 */
export class MainScene extends Phaser.Scene {
  private uiBackend?: UIBackend;
  
  // Referencia al botón de click
  private goldCircle!: Phaser.GameObjects.Graphics;
  private glowCircle!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super({ key: 'MainScene' });
  }

  setUIBackend(backend: UIBackend) {
    this.uiBackend = backend;
  }

  create() {
    console.log('MainScene.create() - inicializando UI');
    this.createBackground();
    this.createUI();
  }

  private createBackground() {
    // Crear gradiente de fondo
    const w = this.getWidth();
    const h = this.getHeight();
    
    // Fondo con gradiente (varias capas para simular)
    const bgGraphics = this.add.graphics();
    
    // Gradiente simple usando rectángulos superpuestos
    for (let i = 0; i < 20; i++) {
      const ratio = i / 20;
      const r = Math.floor(13 + ratio * 13);  // 13 -> 26
      const g = Math.floor(13 + ratio * 13);  // 13 -> 26
      const b = Math.floor(26 + ratio * 12);  // 26 -> 38
      const color = (r << 16) | (g << 8) | b;
      bgGraphics.fillStyle(color, 1);
      bgGraphics.fillRect(0, h * (i / 20), w, h / 20);
    }
    
    // Estrellas/partículas de fondo
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.1, 0.5));
      
      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private getWidth(): number {
    return this.scale.width || window.innerWidth || 800;
  }

  private getHeight(): number {
    return this.scale.height || window.innerHeight || 600;
  }

  /**
   * render() - Método principal para actualizar la UI
   * React llama a este método con los datos del estado
   * Ahora solo maneja el click button - stats están en React
   */
  render(_data: RenderData) {
    console.log('[MainScene] render() llamado - solo click button');
    // Stats ahora están en React - no necesitamos actualizar nada aquí
    // El botón de click no necesita actualizarse dinámicamente
  }

  private createUI() {
    const w = this.getWidth();
    const h = this.getHeight();
    const isMobile = w < 600;

    // === LAYOUT: Only click button ===
    // Stats are now handled by React
    // Center the button vertically in the available space
    
    const buttonY = h / 2;
    const buttonHeight = h;
    this.createClickButton(w, buttonY, isMobile, buttonHeight);
  }

  private createClickButton(w: number, centerY: number, isMobile: boolean, sectionHeight: number) {
    // Make button as big as possible - centered
    // Use more of the available space
    const maxRadius = Math.min(w * 0.35, sectionHeight * 0.35);
    const btnRadius = isMobile ? Math.max(maxRadius, 80) : Math.max(maxRadius, 100);
    const btnY = centerY;
    
    // Glow effect (larger, behind button)
    this.glowCircle = this.add.graphics();
    this.glowCircle.fillStyle(0xffd700, 0.12);
    this.glowCircle.fillCircle(w / 2, btnY, btnRadius + 15);
    this.tweens.add({
      targets: this.glowCircle,
      alpha: { from: 0.4, to: 1 },
      scale: { from: 1, to: 1.08 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    // Second glow ring
    const glowRing = this.add.graphics();
    glowRing.fillStyle(0xffd700, 0.08);
    glowRing.fillCircle(w / 2, btnY, btnRadius + 25);
    this.tweens.add({
      targets: glowRing,
      alpha: { from: 0.2, to: 0.5 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
    
    // Main button
    this.goldCircle = this.add.graphics();
    this.goldCircle.fillStyle(0xffd700, 1);
    this.goldCircle.fillCircle(w / 2, btnY, btnRadius);
    this.goldCircle.lineStyle(4, 0xffaa00, 1);
    this.goldCircle.strokeCircle(w / 2, btnY, btnRadius);
    
    // Inner highlight
    this.goldCircle.fillStyle(0xffe44d, 0.3);
    this.goldCircle.fillCircle(w / 2 - btnRadius * 0.2, btnY - btnRadius * 0.2, btnRadius * 0.4);
    
    // Button text
    const fontSize = Math.max(14, btnRadius * 0.18);
    const clickText = this.add.text(w / 2, btnY + 2, 'CLICK', {
      fontSize: `${fontSize}px`,
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Click area (invisible)
    const clickArea = this.add.rectangle(w / 2, btnY, btnRadius * 2.2, btnRadius * 2.2, 0xffffff, 0);
    clickArea.setInteractive({ useHandCursor: true });
    
    clickArea.on('pointerdown', () => {
      // Scale effect
      this.tweens.add({
        targets: [this.goldCircle, this.glowCircle, clickText],
        scale: 0.88,
        duration: 50,
        yoyo: true,
      });
      
      // Particle sparks
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = btnRadius + 15;
        const sparkle = this.add.circle(
          w / 2 + Math.cos(angle) * dist,
          btnY + Math.sin(angle) * dist,
          3,
          0xffd700
        );
        this.tweens.add({
          targets: sparkle,
          x: w / 2 + Math.cos(angle) * (dist + 60),
          y: btnY + Math.sin(angle) * (dist + 60),
          alpha: 0,
          scale: 0,
          duration: 350,
          onComplete: () => sparkle.destroy(),
        });
      }
      
      // Subtle screen shake
      this.cameras.main.shake(EFFECTS.SHAKE_DURATION, EFFECTS.SHAKE_INTENSITY);
      
      // Notify React
      this.uiBackend?.onClick();
    });
    
    clickArea.on('pointerover', () => {
      this.goldCircle.clear();
      this.goldCircle.fillStyle(0xffe44d, 1);
      this.goldCircle.fillCircle(w / 2, btnY, btnRadius);
      this.goldCircle.lineStyle(4, 0xffcc00, 1);
      this.goldCircle.strokeCircle(w / 2, btnY, btnRadius);
      this.goldCircle.fillStyle(0xffffff, 0.4);
      this.goldCircle.fillCircle(w / 2 - btnRadius * 0.2, btnY - btnRadius * 0.2, btnRadius * 0.4);
      this.glowCircle.setAlpha(0.5);
    });
    
    clickArea.on('pointerout', () => {
      this.goldCircle.clear();
      this.goldCircle.fillStyle(0xffd700, 1);
      this.goldCircle.fillCircle(w / 2, btnY, btnRadius);
      this.goldCircle.lineStyle(4, 0xffaa00, 1);
      this.goldCircle.strokeCircle(w / 2, btnY, btnRadius);
      this.goldCircle.fillStyle(0xffe44d, 0.3);
      this.goldCircle.fillCircle(w / 2 - btnRadius * 0.2, btnY - btnRadius * 0.2, btnRadius * 0.4);
      this.glowCircle.setAlpha(1);
    });
  }
}

export class Game extends Phaser.Game {
  constructor(parent: string) {
    super({
      type: Phaser.AUTO,
      parent,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: MainScene,
    });
  }

  getMainScene(): MainScene {
    return this.scene.getScene('MainScene') as MainScene;
  }
}
