# Pixel Characters - Quick Start Guide

## Installation

1. Copy these files to your project:
   - `PIXEL_CHARACTERS.js` - Main module
   - `CHARACTER_SYSTEM_EXAMPLES.js` - Ready-to-use classes (optional)

2. Include in your HTML:
```html
<script src="./PIXEL_CHARACTERS.js"></script>
<script src="./CHARACTER_SYSTEM_EXAMPLES.js"></script>
```

## 30-Second Render

```javascript
// Get canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Render a character
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, 0, 2);
```

## Character Keys

```
'juan'   - Brand Specialist (Brain Room)
'sofia'  - Creative Lead (Generator Room)
'carlos' - Data Analyst (Validator Room)
'lucia'  - Copywriter (Copy Room)
'marco'  - Researcher (Competition Room)
'ana'    - Data Scientist (Reports Room)
```

## Key Functions

### Rendering

```javascript
// Render character
PIXEL_CHARACTERS.renderCharacter(ctx, x, y, characterKey, outfit, frame, scale);

// Render with label
PIXEL_CHARACTERS.renderCharacterWithLabel(ctx, x, y, characterKey, outfit, scale);

// Isometric projection
PIXEL_CHARACTERS.renderIsometric(ctx, x, y, characterKey, outfit, scale);
```

### Outfits

```javascript
// Get outfit list for a character
const outfits = PIXEL_CHARACTERS.getOutfits('sofia');
// Returns: [{ name: 'Vibrant', colors: {...} }, ...]

// Get outfit colors
const colors = PIXEL_CHARACTERS.getOutfitColors('juan', 0);
// Returns: { skin, shirt, pants, shoes, accent }
```

### Animation

```javascript
// Create animator
const animator = new PIXEL_CHARACTERS.AnimationController('carlos', 0);

// In game loop:
animator.update();
const frame = animator.getCurrentFrame();
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'carlos', 0, frame, 2);

// Control animation:
animator.startWalking();
animator.stopWalking();
animator.setFrameSpeed(10); // Higher = slower
```

## Common Patterns

### Pattern 1: Room with Multiple NPCs

```javascript
const npcs = [
  { key: 'juan', outfit: 0, x: 100, y: 150 },
  { key: 'sofia', outfit: 1, x: 300, y: 150 },
];

npcs.forEach(npc => {
  PIXEL_CHARACTERS.renderCharacterWithLabel(
    ctx, npc.x, npc.y, npc.key, npc.outfit, 2
  );
});
```

### Pattern 2: Animated Character

```javascript
const animator = new PIXEL_CHARACTERS.AnimationController('sofia', 0);
animator.startWalking();

function gameLoop() {
  animator.update();
  const frame = animator.getCurrentFrame();
  PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'sofia', 0, frame, 2);
  requestAnimationFrame(gameLoop);
}
gameLoop();
```

### Pattern 3: Character Selection

```javascript
const characters = ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana'];

characters.forEach(key => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const tempCtx = canvas.getContext('2d');
  PIXEL_CHARACTERS.renderCharacter(tempCtx, 16, 16, key, 0, 0, 1.5);

  canvas.onclick = () => console.log(`Selected: ${key}`);
  document.body.appendChild(canvas);
});
```

### Pattern 4: Using Ready-Made Classes

```javascript
// Room display
const room = new CHARACTER_EXAMPLES.RoomDisplay(canvas, [
  { key: 'juan', outfit: 0, x: 100, y: 150 },
  { key: 'sofia', outfit: 1, x: 300, y: 150 },
]);
room.render();

// Character grid
const grid = new CHARACTER_EXAMPLES.CharacterGrid(container, (key, char) => {
  console.log(`Selected: ${char.name}`);
});
grid.render();

// Walking NPC
const npc = new CHARACTER_EXAMPLES.WalkingNPC('carlos', 100, 100);
npc.moveTo(300, 200);

function gameLoop() {
  npc.update();
  npc.render(ctx);
  requestAnimationFrame(gameLoop);
}
gameLoop();

// Dialogue scene
const dialogue = new CHARACTER_EXAMPLES.DialogueScene(canvas, 'lucia', 0);
dialogue.setDialogue("Hello! I'm the copywriter...");

function dialogueLoop() {
  dialogue.update();
  dialogue.render();
  if (!dialogue.isFinished()) {
    requestAnimationFrame(dialogueLoop);
  }
}
dialogueLoop();
```

## Customization

### Change Outfit Colors

```javascript
// Modify base character colors
PIXEL_CHARACTERS.CHARACTERS.juan.outfits[0].colors.shirt = '#ff0000';

// Now render with updated color
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, 0, 2);
```

### Add Custom Outfit

```javascript
PIXEL_CHARACTERS.CHARACTERS.juan.outfits.push({
  name: 'Cyberpunk',
  colors: {
    skin: '#d4a574',
    shirt: '#00ff00',
    pants: '#0000ff',
    shoes: '#ffff00',
    accent: '#ff00ff'
  }
});

// Use with index 3
PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 3, 0, 2);
```

## Performance Tips

1. **Disable Canvas Smoothing**
   ```javascript
   ctx.imageSmoothingEnabled = false;
   ```

2. **Cache Sprite Sheets** (for animations)
   ```javascript
   const spriteSheet = PIXEL_CHARACTERS.getSpriteSheet('juan', 0);
   // Reuse this data URL instead of rendering each time
   ```

3. **Limit Active Animations**
   ```javascript
   // Only update visible characters
   visibleAnimators.forEach(a => a.update());
   ```

4. **Pre-render Static Characters**
   ```javascript
   // Render once and cache as image
   const cache = new Image();
   const tempCanvas = document.createElement('canvas');
   // render to tempCanvas
   cache.src = tempCanvas.toDataURL();
   // Later, draw cached image
   ctx.drawImage(cache, x, y);
   ```

## Debugging

### Check Available Characters
```javascript
console.log(Object.keys(PIXEL_CHARACTERS.CHARACTERS));
// ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana']
```

### View Character Data
```javascript
console.log(PIXEL_CHARACTERS.CHARACTERS.sofia);
// { name, role, room, personality, baseColors, outfits }
```

### Get All Outfit Names
```javascript
const outfitNames = PIXEL_CHARACTERS.getOutfitNames('carlos');
console.log(outfitNames); // ['Tech', 'Minimal', 'Dark Mode']
```

## File Sizes

- `PIXEL_CHARACTERS.js`: ~20KB
- `CHARACTER_SYSTEM_EXAMPLES.js`: ~15KB
- `CHARACTER_SPRITES.html`: ~50KB (demo)
- `PIXEL_CHARACTERS_DEMO.html`: ~35KB (demo)

No external assets required - all sprites are generated on-demand via Canvas 2D.

## Browser Support

- Chrome 50+
- Firefox 45+
- Safari 13.2+
- Edge 79+

## Examples Included

1. **CHARACTER_SPRITES.html** - Interactive showcase
2. **PIXEL_CHARACTERS_DEMO.html** - Feature demos
3. **CHARACTER_SYSTEM_EXAMPLES.js** - 6 ready-to-use classes

## Next Steps

1. Open `CHARACTER_SPRITES.html` in browser to see all characters
2. Copy patterns from Quick Start guide
3. Use `CHARACTER_SYSTEM_EXAMPLES.js` classes for faster integration
4. Read `PIXEL_CHARACTERS_GUIDE.md` for full API reference

---

**Questions?** Check `PIXEL_CHARACTERS_GUIDE.md` for comprehensive documentation.
