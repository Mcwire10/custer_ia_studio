# Pixel Art Character System - Integration Guide

## Overview

The Pixel Characters system is a data-driven NPC character renderer for the Pokémon-style agency game. It provides:

- **6 Unique NPCs** with distinct roles and personalities
- **3 Outfit Variations** per character with different color schemes
- **Canvas 2D Rendering** with pixel-perfect display
- **Animation Support** with frame-based walking animations
- **Isometric Projection** support for tilemap rendering
- **Runtime Color Customization** via outfit system

---

## Quick Start

### 1. Include the Module

```html
<script src="./PIXEL_CHARACTERS.js"></script>
```

### 2. Basic Character Rendering

```javascript
// Get canvas context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Render a character
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, 0, 2);
//                                 ctx   x     y     key  outfit frame scale
```

### 3. Display with Labels

```javascript
PIXEL_CHARACTERS.renderCharacterWithLabel(ctx, 100, 100, 'sofia', 0, 2);
```

---

## Character Keys & Properties

### Available Characters

```javascript
const characters = ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana'];

// Get character metadata
const character = PIXEL_CHARACTERS.CHARACTERS.juan;
console.log(character.name);        // "Juan"
console.log(character.role);        // "Brand Specialist"
console.log(character.room);        // "Brain Room"
console.log(character.personality); // "Professional, analytical"
```

### Character Details

| Key | Name | Role | Room | Personality |
|-----|------|------|------|-------------|
| `juan` | Juan | Brand Specialist | Brain Room | Professional, analytical |
| `sofia` | Sofia | Creative Lead | Generator Room | Artistic, colorful, expressive |
| `carlos` | Carlos | Data Analyst | Validator Room | Methodical, precise, tech-savvy |
| `lucia` | Lucia | Copywriter | Copy Room | Thoughtful, creative, expressive |
| `marco` | Marco | Researcher | Competition Room | Curious, investigative, sharp |
| `ana` | Ana | Data Scientist | Reports Room | Analytical, insightful, data-driven |

---

## API Reference

### Rendering Functions

#### `renderCharacter(ctx, x, y, characterKey, outfit, frame, scale)`

Render a single character frame to canvas.

**Parameters:**
- `ctx` (CanvasRenderingContext2D): Canvas context
- `x` (number): X position on canvas
- `y` (number): Y position on canvas
- `characterKey` (string): Character identifier ('juan', 'sofia', etc.)
- `outfit` (number): Outfit index (0-2). Default: 0
- `frame` (number): Animation frame (0-3). Default: 0
- `scale` (number): Size multiplier. Default: 1

**Example:**
```javascript
PIXEL_CHARACTERS.renderCharacter(ctx, 50, 50, 'carlos', 1, 0, 3);
```

#### `renderCharacterWithLabel(ctx, x, y, characterKey, outfit, scale)`

Render character with name and role label below.

**Example:**
```javascript
PIXEL_CHARACTERS.renderCharacterWithLabel(ctx, 100, 100, 'lucia', 0, 2);
```

#### `renderIsometric(ctx, x, y, characterKey, outfit, scale)`

Render character in isometric projection for tilemap integration.

**Parameters:**
- `x` (number): Isometric X coordinate
- `y` (number): Isometric Y coordinate

**Example:**
```javascript
// For a 64x32 isometric tile at grid position (5, 3)
PIXEL_CHARACTERS.renderIsometric(ctx, 5, 3, 'marco', 0, 1.5);
```

### Outfit System

#### `getOutfits(characterKey)`

Get all outfit variations for a character.

```javascript
const outfits = PIXEL_CHARACTERS.getOutfits('sofia');
console.log(outfits);
// [
//   { name: 'Vibrant', colors: {...} },
//   { name: 'Sunset', colors: {...} },
//   { name: 'Ocean', colors: {...} }
// ]
```

#### `getOutfitNames(characterKey)`

Get outfit names only.

```javascript
const names = PIXEL_CHARACTERS.getOutfitNames('ana');
// ['Professional', 'Academic', 'Modern']
```

#### `getCharacterData(characterKey)`

Get complete character metadata.

```javascript
const data = PIXEL_CHARACTERS.getCharacterData('juan');
// { name, role, room, personality, baseColors, outfits }
```

### Sprite Generation

#### `getSpriteSheet(characterKey, outfit)`

Generate a 4-frame sprite sheet (128x32px) for a character.

Returns data URL (base64 PNG).

```javascript
const spriteSheet = PIXEL_CHARACTERS.getSpriteSheet('carlos', 0);
const img = new Image();
img.src = spriteSheet;
img.onload = () => {
  ctx.drawImage(img, 0, 0);
};
```

#### `getSingleFrame(characterKey, outfit, frame)`

Get a single character frame as data URL.

```javascript
const frame = PIXEL_CHARACTERS.getSingleFrame('lucia', 1, 2);
```

### Animation Controller

#### `new AnimationController(characterKey, outfit)`

Create an animation controller for a character.

**Methods:**
- `update()`: Advance animation (call each frame)
- `startWalking()`: Begin walking animation
- `stopWalking()`: Stop animation, reset to idle
- `setFrameSpeed(speed)`: Set frame duration (higher = slower)
- `getCurrentFrame()`: Get current animation frame (0-3)
- `reset()`: Reset animation state

**Example:**
```javascript
const animator = new PIXEL_CHARACTERS.AnimationController('juan', 0);

function gameLoop() {
  animator.update();
  const frame = animator.getCurrentFrame();
  PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, frame, 2);
  requestAnimationFrame(gameLoop);
}

// Start walking when needed
document.addEventListener('keydown', (e) => {
  if (e.key === 'w') animator.startWalking();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w') animator.stopWalking();
});
```

---

## Outfit System

Each character has 3 outfit variations with different color schemes.

### Accessing Outfit Colors

```javascript
const colors = PIXEL_CHARACTERS.getOutfitColors('sofia', 1);
console.log(colors);
// {
//   skin: '#d4a574',
//   shirt: '#f97316',
//   pants: '#ea580c',
//   shoes: '#92400e',
//   accent: '#fbbf24'
// }
```

### Custom Outfit Creation

Add custom outfits by modifying character data:

```javascript
PIXEL_CHARACTERS.CHARACTERS.juan.outfits.push({
  name: 'Custom',
  colors: {
    skin: '#d4a574',
    shirt: '#3b82f6',    // Blue shirt
    pants: '#6b7280',    // Gray pants
    shoes: '#1f2937',    // Dark shoes
    accent: '#fbbf24'    // Gold accent
  }
});

// Render with new outfit (index 3)
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 3, 0, 2);
```

---

## Color Palette Reference

### Skin Tones
- `#f4a460` - Sandy brown (Juan)
- `#d4a574` - Medium brown (Sofia, Marco)
- `#c2955d` - Tan (Carlos)
- `#daa06d` - Warm tan (Lucia)
- `#e8c4a0` - Light tan (Ana)

### Professional Colors
- `#1e3a8a` - Dark blue
- `#10b981` - Green
- `#ec4899` - Hot pink
- `#a855f7` - Purple
- `#dc2626` - Red
- `#f59e0b` - Amber

### Accents
- `#fbbf24` - Gold
- `#93c5fd` - Light blue
- `#dbeafe` - Very light blue

---

## Integration Examples

### Example 1: Room Display with All NPCs

```javascript
function renderRoomWithNPCs(ctx, roomNPCs) {
  let xPos = 50;

  roomNPCs.forEach(({ key, outfit }) => {
    PIXEL_CHARACTERS.renderCharacterWithLabel(ctx, xPos, 100, key, outfit, 2);
    xPos += 150;
  });
}

// Usage
renderRoomWithNPCs(ctx, [
  { key: 'juan', outfit: 0 },
  { key: 'sofia', outfit: 1 },
]);
```

### Example 2: Interactive Character Selection

```html
<div id="characterGrid"></div>

<script>
  const characters = ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana'];

  characters.forEach((key) => {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;

    const ctx = canvas.getContext('2d');
    PIXEL_CHARACTERS.renderCharacter(ctx, 32, 32, key, 0, 0, 2);

    canvas.onclick = () => {
      console.log(`Selected: ${PIXEL_CHARACTERS.CHARACTERS[key].name}`);
    };

    document.getElementById('characterGrid').appendChild(canvas);
  });
</script>
```

### Example 3: Walking NPC Animation

```javascript
class NPCCharacter {
  constructor(key, x, y, outfit = 0) {
    this.key = key;
    this.x = x;
    this.y = y;
    this.outfit = outfit;
    this.animator = new PIXEL_CHARACTERS.AnimationController(key, outfit);
  }

  render(ctx) {
    const frame = this.animator.getCurrentFrame();
    PIXEL_CHARACTERS.renderCharacter(ctx, this.x, this.y, this.key, this.outfit, frame, 2);
  }

  update() {
    this.animator.update();
  }

  walk() {
    this.animator.startWalking();
  }

  idle() {
    this.animator.stopWalking();
  }
}

// Usage
const juan = new NPCCharacter('juan', 100, 100);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  juan.update();
  juan.render(ctx);
  requestAnimationFrame(gameLoop);
}

juan.walk();
gameLoop();
```

### Example 4: Isometric Tilemap Integration

```javascript
function renderTilemapWithNPCs(ctx, tileData, npcs) {
  // Render isometric tiles
  for (let x = 0; x < tileData.width; x++) {
    for (let y = 0; y < tileData.height; y++) {
      const isometricX = (x - y) * 32;
      const isometricY = (x + y) * 16;

      // Render tile background...
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(isometricX, isometricY, 64, 32);
    }
  }

  // Render NPCs on top
  npcs.forEach(({ key, tileX, tileY }) => {
    const isometricX = (tileX - tileY) * 32;
    const isometricY = (tileX + tileY) * 16;

    PIXEL_CHARACTERS.renderCharacter(ctx, isometricX + 16, isometricY, key, 0, 0, 1.5);
  });
}

// Usage
renderTilemapWithNPCs(ctx, tileData, [
  { key: 'juan', tileX: 5, tileY: 3 },
  { key: 'sofia', tileX: 6, tileY: 3 },
]);
```

---

## Sprite Data Structure

Each character sprite is procedurally generated from a color palette:

```javascript
{
  name: string,
  role: string,
  room: string,
  personality: string,
  baseColors: {
    skin: hex,
    shirt: hex,
    pants: hex,
    shoes: hex,
    accent: hex
  },
  outfits: [
    {
      name: string,
      colors: { skin, shirt, pants, shoes, accent }
    },
    ...
  ]
}
```

The actual pixel art is rendered on-demand using Canvas 2D. This approach:
- Reduces file size (no image assets needed)
- Allows runtime color customization
- Enables dynamic outfit changes
- Supports easy character generation

---

## Performance Considerations

1. **Rendering Cost**: Each `renderCharacter()` call creates a temporary canvas. For animations, render once and cache if possible.

2. **Sprite Sheets**: Use `getSpriteSheet()` to pre-generate sprite sheets for performance:
   ```javascript
   const spriteSheet = PIXEL_CHARACTERS.getSpriteSheet('juan', 0);
   // Cache and reuse this data URL
   ```

3. **Canvas Scaling**: Use `imageSmoothingEnabled = false` for pixel-perfect display:
   ```javascript
   ctx.imageSmoothingEnabled = false;
   ```

4. **Animation Loop**: Limit animator updates to visible characters:
   ```javascript
   visibleCharacters.forEach(char => char.animator.update());
   ```

---

## Customization Guide

### Adding a New Character

```javascript
PIXEL_CHARACTERS.CHARACTERS.newCharacter = {
  name: 'New Person',
  role: 'New Role',
  room: 'New Room',
  personality: 'Personality traits',
  baseColors: {
    skin: '#d4a574',
    shirt: '#3b82f6',
    pants: '#6b7280',
    shoes: '#1f2937',
    accent: '#fbbf24'
  },
  outfits: [
    {
      name: 'Outfit 1',
      colors: { /* ... */ }
    }
  ]
};

// Now render with:
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'newCharacter', 0, 0, 2);
```

### Modifying Colors

```javascript
// Change Juan's classic outfit color
PIXEL_CHARACTERS.CHARACTERS.juan.outfits[0].colors.shirt = '#ff0000';

// Renders will now use the updated color
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, 0, 2);
```

### Custom Animation Speeds

```javascript
const animator = new PIXEL_CHARACTERS.AnimationController('juan', 0);
animator.setFrameSpeed(5);  // Faster animation
animator.setFrameSpeed(20); // Slower animation
```

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13.2+)
- Requires: Canvas 2D context

---

## File Structure

```
PIXEL_CHARACTERS.js          - Main character system module
CHARACTER_SPRITES.html       - Interactive demo/showcase
PIXEL_CHARACTERS_GUIDE.md    - This documentation
```

---

## Troubleshooting

### Characters not rendering
- Ensure Canvas context is 2D: `canvas.getContext('2d')`
- Check character key spelling: use lowercase ('juan', not 'Juan')
- Verify canvas dimensions match expected size

### Characters too small/large
- Adjust `scale` parameter (1 = 32px, 2 = 64px, 3 = 96px)
- Example: `renderCharacter(ctx, x, y, key, 0, 0, 2)` for 64px

### Pixelated appearance lost
- Set `ctx.imageSmoothingEnabled = false`
- Avoid scaling canvas CSS separately from rendering

### Animation not looping
- Call `animator.update()` every frame
- Ensure `animator.isAnimating` is true
- Check frame speed isn't too high

---

## Version History

- v1.0.0 - Initial release with 6 NPCs, 3 outfits each, animation support

---

## License & Attribution

Pixel Characters System - 8-bit Character Engine for Agency Game
Inspired by Pokémon Mystery Dungeon, Habbo Hotel, and Classic RPGs

For integration support or feature requests, see documentation above.
