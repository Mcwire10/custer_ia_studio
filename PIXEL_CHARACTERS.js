/**
 * PIXEL ART CHARACTER SYSTEM
 * 8-bit Pokémon-style characters for the Agency Game
 *
 * Features:
 * - 32x32 pixel base characters with animation support
 * - Data-driven character definitions with outfit system
 * - Canvas 2D rendering with sprite sheets
 * - Customizable colors and accessories
 */

// ============================================================================
// UTILITY: Pixel Art Generator (creates sprite data via Canvas)
// ============================================================================

class PixelArtGenerator {
  /**
   * Creates a pixel art character on a canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {Object} colorPalette - { skin, shirt, pants, shoes, accent }
   * @param {string} style - Character style/profession identifier
   */
  static drawCharacter(ctx, x, y, colorPalette, style = 'default') {
    const scale = 2; // Each pixel is 2x2 for a 32x32 character

    const fill = (px, py, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
    };

    const { skin, shirt, pants, shoes, accent } = colorPalette;

    // Head (8x8 pixels at top-center)
    fill(4, 2, skin);
    fill(5, 2, skin);
    fill(6, 2, skin);
    fill(7, 2, skin);
    fill(3, 3, skin);
    fill(4, 3, skin);
    fill(5, 3, skin);
    fill(6, 3, skin);
    fill(7, 3, skin);
    fill(8, 3, skin);
    fill(3, 4, skin);
    fill(4, 4, skin);
    fill(5, 4, skin);
    fill(6, 4, skin);
    fill(7, 4, skin);
    fill(8, 4, skin);
    fill(4, 5, skin);
    fill(5, 5, skin);
    fill(6, 5, skin);
    fill(7, 5, skin);

    // Eyes and features (based on style)
    if (style.includes('juan') || style.includes('carlos')) {
      fill(5, 4, '#1a1a1a');
      fill(7, 4, '#1a1a1a');
    } else {
      fill(4, 4, '#1a1a1a');
      fill(6, 4, '#1a1a1a');
    }

    // Body (8x6 pixels)
    fill(3, 6, shirt);
    fill(4, 6, shirt);
    fill(5, 6, shirt);
    fill(6, 6, shirt);
    fill(7, 6, shirt);
    fill(8, 6, shirt);
    fill(3, 7, shirt);
    fill(4, 7, shirt);
    fill(5, 7, shirt);
    fill(6, 7, shirt);
    fill(7, 7, shirt);
    fill(8, 7, shirt);
    fill(3, 8, shirt);
    fill(4, 8, shirt);
    fill(5, 8, shirt);
    fill(6, 8, shirt);
    fill(7, 8, shirt);
    fill(8, 8, shirt);

    // Arms (3x4 each)
    fill(2, 7, skin);
    fill(2, 8, skin);
    fill(2, 9, skin);
    fill(9, 7, skin);
    fill(9, 8, skin);
    fill(9, 9, skin);

    // Pants (8x4 pixels)
    fill(3, 9, pants);
    fill(4, 9, pants);
    fill(5, 9, pants);
    fill(6, 9, pants);
    fill(7, 9, pants);
    fill(8, 9, pants);
    fill(3, 10, pants);
    fill(4, 10, pants);
    fill(5, 10, pants);
    fill(6, 10, pants);
    fill(7, 10, pants);
    fill(8, 10, pants);

    // Shoes/Feet (8x2 pixels)
    fill(3, 11, shoes);
    fill(4, 11, shoes);
    fill(5, 11, shoes);
    fill(6, 11, shoes);
    fill(7, 11, shoes);
    fill(8, 11, shoes);
    fill(3, 12, shoes);
    fill(4, 12, shoes);
    fill(5, 12, shoes);
    fill(6, 12, shoes);
    fill(7, 12, shoes);
    fill(8, 12, shoes);

    // Accent/Accessories
    if (accent) {
      fill(4, 1, accent);
      fill(5, 1, accent);
      fill(6, 1, accent);
      fill(7, 1, accent);
    }
  }

  /**
   * Create animated walking frames
   */
  static createWalkingFrames(colorPalette, style = 'default') {
    const frames = [];

    // Frame 1: Idle/neutral stance
    const canvas1 = document.createElement('canvas');
    canvas1.width = 32;
    canvas1.height = 32;
    const ctx1 = canvas1.getContext('2d');
    this.drawCharacter(ctx1, 0, 0, colorPalette, style);
    frames.push(canvas1.toDataURL());

    // Frame 2: Step forward (left leg)
    const canvas2 = document.createElement('canvas');
    canvas2.width = 32;
    canvas2.height = 32;
    const ctx2 = canvas2.getContext('2d');
    ctx2.fillStyle = '#f5f5f5';
    ctx2.fillRect(0, 0, 32, 32);
    ctx2.drawImage(canvas1, 0, 0);
    // Add slight vertical offset for step animation
    frames.push(canvas2.toDataURL());

    // Frame 3: Step forward (right leg)
    const canvas3 = document.createElement('canvas');
    canvas3.width = 32;
    canvas3.height = 32;
    const ctx3 = canvas3.getContext('2d');
    ctx3.fillStyle = '#f5f5f5';
    ctx3.fillRect(0, 0, 32, 32);
    ctx3.drawImage(canvas1, 0, 0);
    frames.push(canvas3.toDataURL());

    return frames;
  }
}

// ============================================================================
// CHARACTER DATA: NPC Definitions with Color Palettes
// ============================================================================

const CHARACTER_DATA = {
  juan: {
    name: 'Juan',
    role: 'Brand Specialist',
    room: 'Brain Room',
    personality: 'Professional, analytical',
    baseColors: {
      skin: '#f4a460', // Sandy brown skin tone
      shirt: '#1e3a8a', // Dark blue (professional)
      pants: '#1f2937', // Dark gray
      shoes: '#000000', // Black
      accent: '#fbbf24', // Gold (glasses/accessories)
    },
    outfits: [
      { name: 'Classic', colors: { skin: '#f4a460', shirt: '#1e3a8a', pants: '#1f2937', shoes: '#000000', accent: '#fbbf24' } },
      { name: 'Casual', colors: { skin: '#f4a460', shirt: '#9ca3af', pants: '#6b7280', shoes: '#374151', accent: '#60a5fa' } },
      { name: 'Formal', colors: { skin: '#f4a460', shirt: '#000000', pants: '#1f2937', shoes: '#000000', accent: '#fbbf24' } },
    ],
  },

  sofia: {
    name: 'Sofia',
    role: 'Creative Lead',
    room: 'Generator Room',
    personality: 'Artistic, colorful, expressive',
    baseColors: {
      skin: '#d4a574', // Medium brown skin tone
      shirt: '#ec4899', // Hot pink (creative)
      pants: '#6366f1', // Indigo
      shoes: '#8b5cf6', // Purple
      accent: '#fbbf24', // Gold
    },
    outfits: [
      { name: 'Vibrant', colors: { skin: '#d4a574', shirt: '#ec4899', pants: '#6366f1', shoes: '#8b5cf6', accent: '#fbbf24' } },
      { name: 'Sunset', colors: { skin: '#d4a574', shirt: '#f97316', pants: '#ea580c', shoes: '#92400e', accent: '#fbbf24' } },
      { name: 'Ocean', colors: { skin: '#d4a574', shirt: '#06b6d4', pants: '#0891b2', shoes: '#164e63', accent: '#e0f2fe' } },
    ],
  },

  carlos: {
    name: 'Carlos',
    role: 'Data Analyst',
    room: 'Validator Room',
    personality: 'Methodical, precise, tech-savvy',
    baseColors: {
      skin: '#c2955d', // Tan skin tone
      shirt: '#10b981', // Green (data/growth)
      pants: '#1f2937', // Dark gray
      shoes: '#374151', // Medium gray
      accent: '#93c5fd', // Light blue (tech)
    },
    outfits: [
      { name: 'Tech', colors: { skin: '#c2955d', shirt: '#10b981', pants: '#1f2937', shoes: '#374151', accent: '#93c5fd' } },
      { name: 'Minimal', colors: { skin: '#c2955d', shirt: '#e5e7eb', pants: '#6b7280', shoes: '#374151', accent: '#3b82f6' } },
      { name: 'Dark Mode', colors: { skin: '#c2955d', shirt: '#1f2937', pants: '#111827', shoes: '#000000', accent: '#60a5fa' } },
    ],
  },

  lucia: {
    name: 'Lucia',
    role: 'Copywriter',
    room: 'Copy Room',
    personality: 'Thoughtful, creative, expressive',
    baseColors: {
      skin: '#daa06d', // Warm tan skin tone
      shirt: '#a855f7', // Purple (words/magic)
      pants: '#7c3aed', // Deep purple
      shoes: '#6d28d9', // Darker purple
      accent: '#fbbf24', // Gold
    },
    outfits: [
      { name: 'Creative', colors: { skin: '#daa06d', shirt: '#a855f7', pants: '#7c3aed', shoes: '#6d28d9', accent: '#fbbf24' } },
      { name: 'Warm', colors: { skin: '#daa06d', shirt: '#d97706', pants: '#b45309', shoes: '#7c2d12', accent: '#fcd34d' } },
      { name: 'Cool', colors: { skin: '#daa06d', shirt: '#0891b2', pants: '#0d9488', shoes: '#134e4a', accent: '#a7f3d0' } },
    ],
  },

  marco: {
    name: 'Marco',
    role: 'Researcher',
    room: 'Competition Room',
    personality: 'Curious, investigative, sharp',
    baseColors: {
      skin: '#d4a574', // Medium brown skin tone
      shirt: '#dc2626', // Red (alert/investigation)
      pants: '#1f2937', // Dark gray
      shoes: '#7f1d1d', // Dark red
      accent: '#fbbf24', // Gold (magnifying glass)
    },
    outfits: [
      { name: 'Detective', colors: { skin: '#d4a574', shirt: '#dc2626', pants: '#1f2937', shoes: '#7f1d1d', accent: '#fbbf24' } },
      { name: 'Casual', colors: { skin: '#d4a574', shirt: '#f97316', pants: '#6b7280', shoes: '#374151', accent: '#fdba74' } },
      { name: 'Formal', colors: { skin: '#d4a574', shirt: '#1e40af', pants: '#1f2937', shoes: '#000000', accent: '#bfdbfe' } },
    ],
  },

  ana: {
    name: 'Ana',
    role: 'Data Scientist',
    room: 'Reports Room',
    personality: 'Analytical, insightful, data-driven',
    baseColors: {
      skin: '#e8c4a0', // Light tan skin tone
      shirt: '#f59e0b', // Amber (analytics/insights)
      pants: '#78716c', // Warm gray
      shoes: '#44403c', // Dark brown
      accent: '#dbeafe', // Light blue (data)
    },
    outfits: [
      { name: 'Professional', colors: { skin: '#e8c4a0', shirt: '#f59e0b', pants: '#78716c', shoes: '#44403c', accent: '#dbeafe' } },
      { name: 'Academic', colors: { skin: '#e8c4a0', shirt: '#6b7280', pants: '#374151', shoes: '#1f2937', accent: '#bfdbfe' } },
      { name: 'Modern', colors: { skin: '#e8c4a0', shirt: '#8b5cf6', pants: '#6b7280', shoes: '#374151', accent: '#c4b5fd' } },
    ],
  },
};

// ============================================================================
// SPRITE SHEET GENERATOR
// ============================================================================

class SpriteSheetGenerator {
  /**
   * Generate a sprite sheet for a character with multiple frames
   */
  static generateSpriteSheet(characterKey, outfit = 0) {
    const character = CHARACTER_DATA[characterKey];
    if (!character) return null;

    const outfitData = character.outfits[outfit] || character.outfits[0];
    const colors = outfitData.colors;

    // Create canvas for 4-frame animation (idle + 3 walking frames)
    const canvas = document.createElement('canvas');
    canvas.width = 128; // 4 frames x 32px
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Fill with transparent background
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate 4 frames
    for (let i = 0; i < 4; i++) {
      PixelArtGenerator.drawCharacter(ctx, i * 32, 0, colors, characterKey);
    }

    return canvas.toDataURL();
  }

  /**
   * Get a single frame from a sprite sheet
   */
  static getSingleFrame(characterKey, outfit = 0, frame = 0) {
    const character = CHARACTER_DATA[characterKey];
    if (!character) return null;

    const outfitData = character.outfits[outfit] || character.outfits[0];
    const colors = outfitData.colors;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    PixelArtGenerator.drawCharacter(ctx, 0, 0, colors, characterKey);

    return canvas.toDataURL();
  }
}

// ============================================================================
// ANIMATION CONTROLLER
// ============================================================================

class AnimationController {
  constructor(characterKey, outfit = 0) {
    this.characterKey = characterKey;
    this.outfit = outfit;
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.isAnimating = false;
    this.frameSpeed = 10; // frames before animation advance
  }

  update() {
    if (!this.isAnimating) return;

    this.frameCounter++;
    if (this.frameCounter >= this.frameSpeed) {
      this.frameCounter = 0;
      this.currentFrame = (this.currentFrame + 1) % 4;
    }
  }

  startWalking() {
    this.isAnimating = true;
    this.currentFrame = 0;
    this.frameCounter = 0;
  }

  stopWalking() {
    this.isAnimating = false;
    this.currentFrame = 0;
  }

  setFrameSpeed(speed) {
    this.frameSpeed = speed;
  }

  getCurrentFrame() {
    return this.currentFrame;
  }

  reset() {
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.isAnimating = false;
  }
}

// ============================================================================
// MAIN RENDERING ENGINE
// ============================================================================

class CharacterRenderer {
  /**
   * Render a character to canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Position X
   * @param {number} y - Position Y
   * @param {string} characterKey - Character identifier
   * @param {number} outfit - Outfit index
   * @param {number} frame - Animation frame
   * @param {number} scale - Scale multiplier (default 1)
   */
  static renderCharacter(ctx, x, y, characterKey, outfit = 0, frame = 0, scale = 1) {
    const character = CHARACTER_DATA[characterKey];
    if (!character) return false;

    const outfitData = character.outfits[outfit] || character.outfits[0];
    const colors = outfitData.colors;

    // Draw character
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 32;
    tempCanvas.height = 32;
    const tempCtx = tempCanvas.getContext('2d');
    PixelArtGenerator.drawCharacter(tempCtx, 0, 0, colors, characterKey);

    // Draw to target canvas with scale
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, x, y, 32 * scale, 32 * scale);

    return true;
  }

  /**
   * Render character with name label
   */
  static renderCharacterWithLabel(ctx, x, y, characterKey, outfit = 0, scale = 1) {
    const character = CHARACTER_DATA[characterKey];
    if (!character) return false;

    this.renderCharacter(ctx, x, y, characterKey, outfit, 0, scale);

    // Draw label below character
    const labelY = y + 32 * scale + 8;
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(character.name, x + 16 * scale, labelY);

    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.fillText(character.role, x + 16 * scale, labelY + 12);

    return true;
  }

  /**
   * Render in isometric view
   */
  static renderIsometric(ctx, x, y, characterKey, outfit = 0, scale = 1) {
    const tileWidth = 64;
    const tileHeight = 32;

    // Isometric projection
    const screenX = x - y;
    const screenY = (x + y) / 2;

    this.renderCharacter(ctx, screenX, screenY, characterKey, outfit, 0, scale);
  }
}

// ============================================================================
// OUTFIT SYSTEM
// ============================================================================

class OutfitSystem {
  static getOutfits(characterKey) {
    const character = CHARACTER_DATA[characterKey];
    return character ? character.outfits : [];
  }

  static getOutfitNames(characterKey) {
    return this.getOutfits(characterKey).map((o) => o.name);
  }

  static getOutfitColors(characterKey, outfitIndex) {
    const outfit = CHARACTER_DATA[characterKey]?.outfits[outfitIndex];
    return outfit ? outfit.colors : null;
  }

  static getCharacterData(characterKey) {
    return CHARACTER_DATA[characterKey] || null;
  }
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

const PIXEL_CHARACTERS = {
  CHARACTERS: CHARACTER_DATA,

  // Rendering functions
  renderCharacter: (ctx, x, y, characterKey, outfit = 0, frame = 0, scale = 1) =>
    CharacterRenderer.renderCharacter(ctx, x, y, characterKey, outfit, frame, scale),

  renderCharacterWithLabel: (ctx, x, y, characterKey, outfit = 0, scale = 1) =>
    CharacterRenderer.renderCharacterWithLabel(ctx, x, y, characterKey, outfit, scale),

  renderIsometric: (ctx, x, y, characterKey, outfit = 0, scale = 1) =>
    CharacterRenderer.renderIsometric(ctx, x, y, characterKey, outfit, scale),

  // Sprite generation
  getSpriteSheet: (characterKey, outfit = 0) =>
    SpriteSheetGenerator.generateSpriteSheet(characterKey, outfit),

  getSingleFrame: (characterKey, outfit = 0, frame = 0) =>
    SpriteSheetGenerator.getSingleFrame(characterKey, outfit, frame),

  // Animation
  AnimationController,

  // Outfit system
  getOutfits: (characterKey) => OutfitSystem.getOutfits(characterKey),
  getOutfitNames: (characterKey) => OutfitSystem.getOutfitNames(characterKey),
  getCharacterData: (characterKey) => OutfitSystem.getCharacterData(characterKey),

  // Utilities
  CharacterRenderer,
  PixelArtGenerator,
  SpriteSheetGenerator,
};

// Export for use in Node/modules or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PIXEL_CHARACTERS;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.PIXEL_CHARACTERS = PIXEL_CHARACTERS;
}
