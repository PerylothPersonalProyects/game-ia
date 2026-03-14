import Phaser from 'phaser';
import type { RenderData } from './gameApi';
import type { RenderUpgradeData, RenderStatsData } from './gameApi';

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
  
  // Referencias para actualizar el UI
  private coinText!: Phaser.GameObjects.Text;
  private cpsText!: Phaser.GameObjects.Text;
  private cpcText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private upgradeRows: Map<string, {
    bg: Phaser.GameObjects.Rectangle;
    costText: Phaser.GameObjects.Text;
    levelText: Phaser.GameObjects.Text;
    buyBtn: Phaser.GameObjects.Rectangle;
    buyText: Phaser.GameObjects.Text;
    nameText: Phaser.GameObjects.Text;
  }> = new Map();

  constructor() {
    super({ key: 'MainScene' });
  }

  setUIBackend(backend: UIBackend) {
    this.uiBackend = backend;
  }

  create() {
    console.log('MainScene.create() - inicializando UI');
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.createUI();
    // Por ahora deshabilitado el resize porque causa loops
    // this.scale.on('resize', this.handleResize, this);
  }

  private getWidth(): number {
    return this.scale.width || window.innerWidth || 800;
  }

  private getHeight(): number {
    return this.scale.height || window.innerHeight || 600;
  }

  // Lista de IDs de upgrades (se configura desde React)
  private upgradeIds: string[] = [];

  setUpgradeIds(ids: string[]) {
    this.upgradeIds = ids;
  }

  /**
   * render() - Método principal para actualizar la UI
   * React llama a este método con los datos del estado
   */
  render(data: RenderData) {
    console.log('[MainScene] render() llamado con', data.upgrades.length, 'upgrades');
    this.updateStats(data.stats);
    
    // Si no hay filas creadas o la cantidad cambió, recrear el panel
    if (this.upgradeRows.size === 0 && data.upgrades.length > 0) {
      this.createUpgradesFromData(data.upgrades);
    }
    
    this.updateUpgrades(data.upgrades);
  }

  private createUpgradesFromData(upgrades: RenderUpgradeData[]) {
    console.log('[MainScene] Creando panel de upgrades con', upgrades.length, 'items');
    
    const w = this.getWidth();
    const h = this.getHeight();
    const isMobile = w < 600;
    
    const panelX = isMobile ? w / 2 : w * 0.70;
    const panelY = isMobile ? h * 0.60 : h * 0.45;
    const panelW = isMobile ? w * 0.95 : w * 0.28;
    const panelH = isMobile ? h * 0.35 : h * 0.65;
    
    // Título
    const titleY = panelY - panelH / 2 + 20;
    this.add.text(panelX, titleY, 'MEJORAS', {
      fontSize: '14px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Crear filas
    const rowStartY = titleY + 25;
    const rowHeight = 36;
    const innerW = panelW - 20;
    
    upgrades.forEach((upgrade: RenderUpgradeData, i: number) => {
      const rowY = rowStartY + i * (rowHeight + 4);
      this.createUpgradeRowFromData(upgrade, i, rowY, panelX, panelW, innerW, rowHeight);
    });
  }

  private createUpgradeRowFromData(
    upgrade: RenderUpgradeData,
    index: number,
    rowY: number,
    panelX: number,
    panelW: number,
    innerW: number,
    rowHeight: number
  ) {
    const bgColor = index % 2 === 0 ? 0x1a1a2e : 0x1f1f3a;
    
    const bg = this.add.rectangle(panelX, rowY, panelW - 10, rowHeight, bgColor);
    bg.setStrokeStyle(1, 0x333355);
    bg.setInteractive({ useHandCursor: false });
    
    const col1 = panelX - innerW / 2 + 25;
    const col2 = panelX - innerW / 2 + 70;
    const col3 = panelX - innerW / 2 + 115;
    const col4 = panelX - innerW / 2 + 160;
    
    const nameText = this.add.text(col1, rowY, upgrade.name || '-', {
      fontSize: '11px',
      color: '#555',
    }).setOrigin(0, 0.5);
    
    const levelText = this.add.text(col2, rowY, '0', {
      fontSize: '11px',
      color: '#fff',
    }).setOrigin(0, 0.5);
    
    const costText = this.add.text(col3, rowY, '0', {
      fontSize: '11px',
      color: '#555',
    }).setOrigin(0, 0.5);
    
    const buyBtn = this.add.rectangle(col4 + 10, rowY, 28, 24, 0x333333);
    buyBtn.setStrokeStyle(1, 0x555555);
    buyBtn.setInteractive({ useHandCursor: true });
    
    // Click handler para comprar
    buyBtn.on('pointerdown', () => {
      if (this.uiBackend) {
        this.uiBackend.onPurchaseUpgrade(upgrade.id);
      }
    });
    
    const buyText = this.add.text(col4 + 10, rowY, 'X', {
      fontSize: '10px',
      color: '#555',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const rowData = { bg, costText, levelText, buyBtn, buyText, nameText };
    this.upgradeRows.set(upgrade.id, rowData);
    
    // Hover effect
    bg.on('pointerover', () => {
      this.descText?.setText(upgrade.description || `Mejora ${index + 1}`);
      bg.setFillStyle(0x2a3a4a);
    });
    
    bg.on('pointerout', () => {
      this.descText?.setText('Pasa el mouse sobre una mejora para ver su descripción');
      bg.setFillStyle(bgColor);
    });
  }

  private updateStats(stats: RenderStatsData) {
    if (this.coinText) {
      this.coinText.setText(stats.coins.toString());
    }
    if (this.cpsText) {
      this.cpsText.setText(`${stats.coinsPerSecond} / seg`);
    }
    if (this.cpcText) {
      this.cpcText.setText(`${stats.coinsPerClick} / click`);
    }
  }

  private updateUpgrades(upgrades: RenderUpgradeData[]) {
    // Actualizar filas existentes con los datos
    upgrades.forEach((upgrade) => {
      const existing = this.upgradeRows.get(upgrade.id);
      
      if (existing) {
        // Actualizar fila existente
        existing.costText.setText(upgrade.cost.toString());
        existing.costText.setColor(upgrade.canAfford ? '#ffd700' : '#555');
        existing.levelText.setText(upgrade.level.toString());
        existing.nameText.setColor(upgrade.canAfford ? '#4ecdc4' : '#555');
        
        existing.buyBtn.setFillStyle(upgrade.canAfford ? 0x4ecdc4 : 0x333333);
        existing.buyBtn.setStrokeStyle(1, upgrade.canAfford ? 0xffffff : 0x555555);
        existing.buyBtn.setInteractive({ useHandCursor: upgrade.canAfford });
        
        existing.buyText.setText(upgrade.canAfford ? 'OK' : 'X');
        existing.buyText.setColor(upgrade.canAfford ? '#000' : '#555');
      }
    });
  }

  private createUI() {
    const w = this.getWidth();
    const h = this.getHeight();
    const isMobile = w < 600;

    // === HEADER: Stats ===
    const coinY = isMobile ? 30 : 40;
    
    this.coinText = this.add.text(w / 2, coinY - 10, '0', {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.cpsText = this.add.text(w / 2, coinY + 12, '0 / seg', {
      fontSize: '12px',
      color: '#4ecdc4',
    }).setOrigin(0.5);

    this.cpcText = this.add.text(w / 2, coinY + 26, '1 / click', {
      fontSize: '10px',
      color: '#888',
    }).setOrigin(0.5);

    // === BOTÓN DE ORO ===
    const btnRadius = isMobile ? Math.min(w, h) * 0.12 : Math.min(w, h) * 0.08;
    const btnY = isMobile ? h * 0.30 : h * 0.35;
    
    const goldCircle = this.add.circle(w / 2, btnY, btnRadius, 0xffd700);
    goldCircle.setStrokeStyle(3, 0xffaa00);
    
    this.add.text(w / 2, btnY, 'CLICK', {
      fontSize: `${Math.max(12, btnRadius * 0.2)}px`,
      color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    goldCircle.setInteractive({ useHandCursor: true });
    
    goldCircle.on('pointerdown', () => {
      this.tweens.add({
        targets: goldCircle,
        scale: 0.9,
        duration: 50,
        yoyo: true,
      });
      // Notificar a React
      this.uiBackend?.onClick();
    });
    
    goldCircle.on('pointerover', () => goldCircle.setFillStyle(0xffe44d));
    goldCircle.on('pointerout', () => goldCircle.setFillStyle(0xffd700));

    // === PANEL DE UPGRADES ===
    this.createUpgradesPanel(w, h, isMobile);
  }

  private createUpgradesPanel(w: number, h: number, isMobile: boolean) {
    const panelX = isMobile ? w / 2 : w * 0.70;
    const panelY = isMobile ? h * 0.60 : h * 0.45;
    const panelW = isMobile ? w * 0.95 : w * 0.28;
    const panelH = isMobile ? h * 0.35 : h * 0.65;
    
    // Fondo del panel
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x16213e).setStrokeStyle(2, 0x4ecdc4);
    
    // Título
    const titleY = panelY - panelH / 2 + 20;
    this.add.text(panelX, titleY, 'MEJORAS', {
      fontSize: '14px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // === ÁREA DE DESCRIPCIÓN ===
    const descY = panelY + panelH / 2 - 30;
    this.add.rectangle(panelX, descY, panelW - 20, 40, 0x0f0f23).setStrokeStyle(1, 0x333355);
    
    this.descText = this.add.text(panelX, descY, 'Cargando mejoras...', {
      fontSize: '11px',
      color: '#888',
      wordWrap: { width: panelW - 30 },
      align: 'center',
    }).setOrigin(0.5);
  }

  private createUpgradeRowPlaceholder(
    upgradeId: string,
    index: number,
    rowY: number,
    panelX: number,
    panelW: number,
    innerW: number,
    rowHeight: number
  ) {
    const bgColor = index % 2 === 0 ? 0x1a1a2e : 0x1f1f3a;
    
    // Fondo de la fila
    const bg = this.add.rectangle(panelX, rowY, panelW - 10, rowHeight, bgColor);
    bg.setStrokeStyle(1, 0x333355);
    bg.setInteractive({ useHandCursor: false });
    
    const col1 = panelX - innerW / 2 + 25;
    const col2 = panelX - innerW / 2 + 70;
    const col3 = panelX - innerW / 2 + 115;
    const col4 = panelX - innerW / 2 + 160;
    
    const nameText = this.add.text(col1, rowY, '-', {
      fontSize: '11px',
      color: '#555',
    }).setOrigin(0, 0.5);
    
    const levelText = this.add.text(col2, rowY, '0', {
      fontSize: '11px',
      color: '#fff',
    }).setOrigin(0, 0.5);
    
    const costText = this.add.text(col3, rowY, '0', {
      fontSize: '11px',
      color: '#555',
    }).setOrigin(0, 0.5);
    
    const buyBtn = this.add.rectangle(col4 + 10, rowY, 28, 24, 0x333333);
    buyBtn.setStrokeStyle(1, 0x555555);
    buyBtn.setInteractive({ useHandCursor: false });
    
    const buyText = this.add.text(col4 + 10, rowY, 'X', {
      fontSize: '10px',
      color: '#555',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Guardar referencias
    const rowData = { bg, costText, levelText, buyBtn, buyText, nameText };
    // Guardar referencias usando el ID correcto
    this.upgradeRows.set(upgradeId, rowData);
    
    // Hover effect placeholder
    bg.on('pointerover', () => {
      this.descText.setText('Mejora ' + (index + 1));
      bg.setFillStyle(0x2a3a4a);
    });
    
    bg.on('pointerout', () => {
      this.descText.setText('Pasa el mouse sobre una mejora para ver su descripción');
      bg.setFillStyle(bgColor);
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
