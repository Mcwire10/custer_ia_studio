# Pixel Characters Integration Guide

## How to Integrate into Your Existing Game

This guide shows how to integrate the Pixel Characters system into your agency game.

---

## Step 1: Add Script References

In your main HTML file (e.g., `index.html` or your game template):

```html
<!-- Core character system -->
<script src="./PIXEL_CHARACTERS.js"></script>

<!-- Optional: Ready-to-use classes -->
<script src="./CHARACTER_SYSTEM_EXAMPLES.js"></script>
```

Place these just before your main game script:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Agency Game</title>
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>

  <!-- Character System -->
  <script src="./PIXEL_CHARACTERS.js"></script>
  <script src="./CHARACTER_SYSTEM_EXAMPLES.js"></script>

  <!-- Your Game -->
  <script src="./game.js"></script>
</body>
</html>
```

---

## Step 2: Initialize Game Canvas

In your game initialization code:

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // Important for pixel art!
```

---

## Step 3: Render Characters in Rooms

### Example: Brain Room Display

```javascript
class BrainRoom {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.npcs = [
      { key: 'juan', outfit: 0, x: 150, y: 200 },
      { key: 'sofia', outfit: 1, x: 350, y: 200 },
    ];
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw room background
    this.drawRoom();

    // Draw NPCs
    this.npcs.forEach(npc => {
      PIXEL_CHARACTERS.renderCharacterWithLabel(
        this.ctx,
        npc.x,
        npc.y,
        npc.key,
        npc.outfit,
        2
      );
    });

    // Draw room title
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Brain Room', 20, 40);
  }

  drawRoom() {
    // Draw decorative border
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
  }
}

// Usage:
const brainRoom = new BrainRoom(canvas);
brainRoom.render();
```

---

## Step 4: Add Interactive Menus

### Example: Character Selection Menu

```javascript
class CharacterSelectMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.characters = ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana'];
    this.selectedIndex = 0;
    this.setupMouseListener();
  }

  setupMouseListener() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.characters.forEach((key, idx) => {
        const charX = 100 + (idx % 3) * 250;
        const charY = 150 + Math.floor(idx / 3) * 250;

        if (x > charX && x < charX + 100 && y > charY && y < charY + 120) {
          this.selectCharacter(idx);
        }
      });
    });
  }

  selectCharacter(index) {
    this.selectedIndex = index;
    console.log(`Selected: ${this.characters[index]}`);
    // Trigger game event, etc.
  }

  render() {
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillText('Select Your Team', 250, 50);

    this.characters.forEach((key, idx) => {
      const charX = 100 + (idx % 3) * 250;
      const charY = 150 + Math.floor(idx / 3) * 250;

      // Draw character
      PIXEL_CHARACTERS.renderCharacter(
        this.ctx,
        charX + 20,
        charY,
        key,
        0,
        0,
        2
      );

      // Highlight selected
      if (idx === this.selectedIndex) {
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(charX, charY - 10, 120, 150);
      }

      // Draw name
      const character = PIXEL_CHARACTERS.CHARACTERS[key];
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(character.name, charX + 60, charY + 130);
    });
  }
}

// Usage:
const selectMenu = new CharacterSelectMenu(canvas);

function menuLoop() {
  selectMenu.render();
  requestAnimationFrame(menuLoop);
}
menuLoop();
```

---

## Step 5: Animate Walking NPCs

### Example: NPC Walking in Room

```javascript
class RoomWithAnimatedNPC {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Create walking NPC
    this.juan = new CHARACTER_EXAMPLES.WalkingNPC('juan', 100, 300);
    this.isRunning = false;
  }

  handleInput(key) {
    if (key === 'ArrowUp') {
      this.juan.setVelocity(0, -2);
    } else if (key === 'ArrowDown') {
      this.juan.setVelocity(0, 2);
    } else if (key === 'ArrowLeft') {
      this.juan.setVelocity(-2, 0);
    } else if (key === 'ArrowRight') {
      this.juan.setVelocity(2, 0);
    }
  }

  handleKeyUp() {
    this.juan.idle();
  }

  update(deltaTime = 16) {
    this.juan.update(deltaTime);
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw room border
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

    // Draw NPC
    this.juan.render(this.ctx);

    // Draw position info
    this.ctx.fillStyle = '#333';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `Position: ${Math.round(this.juan.x)}, ${Math.round(this.juan.y)}`,
      30,
      this.canvas.height - 20
    );
  }

  run() {
    this.isRunning = true;
    this.startGameLoop();
    this.setupInputListeners();
  }

  startGameLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }

  setupInputListeners() {
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleInput(e.key);
      }
    });

    document.addEventListener('keyup', () => {
      this.handleKeyUp();
    });
  }
}

// Usage:
const room = new RoomWithAnimatedNPC(canvas);
room.run();
```

---

## Step 6: Display Dialogue Scenes

### Example: NPC Dialogue

```javascript
class DialogueManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scenes = {};
    this.currentScene = null;
  }

  addDialogueScene(id, npcKey, outfit, text) {
    this.scenes[id] = {
      id,
      npcKey,
      outfit,
      text,
      scene: new CHARACTER_EXAMPLES.DialogueScene(this.canvas, npcKey, outfit)
    };
  }

  startDialogue(sceneId) {
    const dialogueData = this.scenes[sceneId];
    if (!dialogueData) return;

    this.currentScene = dialogueData;
    this.currentScene.scene.setDialogue(dialogueData.text);
    this.playDialogue();
  }

  playDialogue() {
    const loop = () => {
      this.currentScene.scene.update();
      this.currentScene.scene.render();

      if (!this.currentScene.scene.isFinished()) {
        requestAnimationFrame(loop);
      } else {
        this.onDialogueFinished();
      }
    };
    loop();
  }

  onDialogueFinished() {
    console.log('Dialogue finished!');
  }
}

// Usage:
const dialogueManager = new DialogueManager(canvas);

dialogueManager.addDialogueScene(
  'sofia-greeting',
  'sofia',
  1,
  "Welcome! I'm Sofia, the Creative Lead. I help generate amazing brand ideas and creative concepts for our clients."
);

dialogueManager.addDialogueScene(
  'juan-analysis',
  'juan',
  0,
  "Hi there! I'm Juan, the Brand Specialist. I analyze market trends and help position our clients for success."
);

// Trigger dialogues
// dialogueManager.startDialogue('sofia-greeting');
```

---

## Step 7: Room Manager Integration

### Example: Unified Room Management

```javascript
class GameRoomManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentRoom = null;
    this.rooms = {
      brain: {
        name: 'Brain Room',
        npcs: [
          { key: 'juan', outfit: 0, x: 150, y: 250, animated: true },
          { key: 'sofia', outfit: 1, x: 350, y: 250, animated: false },
        ],
      },
      creative: {
        name: 'Generator Room',
        npcs: [
          { key: 'sofia', outfit: 0, x: 200, y: 250, animated: true },
          { key: 'lucia', outfit: 2, x: 400, y: 250, animated: false },
        ],
      },
      validator: {
        name: 'Validator Room',
        npcs: [
          { key: 'carlos', outfit: 0, x: 200, y: 250, animated: true },
          { key: 'marco', outfit: 1, x: 400, y: 250, animated: false },
        ],
      },
    };

    this.animators = {};
    this.initializeAnimators();
  }

  initializeAnimators() {
    Object.values(this.rooms).forEach(room => {
      room.npcs.forEach((npc, idx) => {
        if (npc.animated) {
          const key = `${room.name}-${idx}`;
          this.animators[key] = new PIXEL_CHARACTERS.AnimationController(
            npc.key,
            npc.outfit
          );
          this.animators[key].startWalking();
        }
      });
    });
  }

  loadRoom(roomId) {
    this.currentRoom = this.rooms[roomId];
  }

  update() {
    if (!this.currentRoom) return;

    Object.values(this.animators).forEach(animator => {
      animator.update();
    });
  }

  render() {
    if (!this.currentRoom) return;

    // Clear
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Room background
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

    // Title
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(this.currentRoom.name, 30, 50);

    // NPCs
    this.currentRoom.npcs.forEach((npc, idx) => {
      const frame = npc.animated
        ? this.animators[`${this.currentRoom.name}-${idx}`].getCurrentFrame()
        : 0;

      PIXEL_CHARACTERS.renderCharacter(
        this.ctx,
        npc.x,
        npc.y,
        npc.key,
        npc.outfit,
        frame,
        2
      );
    });
  }

  run() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// Usage:
const roomManager = new GameRoomManager(canvas);
roomManager.loadRoom('brain'); // Load Brain Room
roomManager.run();

// Switch rooms later:
// roomManager.loadRoom('creative');
// roomManager.loadRoom('validator');
```

---

## Integration Patterns

### Pattern 1: Static Room Display

```javascript
// Simple static display of NPCs in a room
const brainRoomNPCs = [
  { key: 'juan', outfit: 0, x: 100, y: 200 },
  { key: 'sofia', outfit: 1, x: 300, y: 200 },
];

function renderStaticRoom() {
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  brainRoomNPCs.forEach(npc => {
    PIXEL_CHARACTERS.renderCharacterWithLabel(
      ctx,
      npc.x,
      npc.y,
      npc.key,
      npc.outfit,
      2
    );
  });
}
```

### Pattern 2: Animated Room

```javascript
// Room with animated NPCs
const roomAnimators = {
  juan: new PIXEL_CHARACTERS.AnimationController('juan', 0),
  sofia: new PIXEL_CHARACTERS.AnimationController('sofia', 1),
};

function renderAnimatedRoom() {
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  Object.values(roomAnimators).forEach(a => a.update());

  PIXEL_CHARACTERS.renderCharacter(
    ctx,
    100,
    200,
    'juan',
    0,
    roomAnimators.juan.getCurrentFrame(),
    2
  );
  PIXEL_CHARACTERS.renderCharacter(
    ctx,
    300,
    200,
    'sofia',
    1,
    roomAnimators.sofia.getCurrentFrame(),
    2
  );
}

function gameLoop() {
  renderAnimatedRoom();
  requestAnimationFrame(gameLoop);
}
gameLoop();
```

### Pattern 3: Interactive Menu

```javascript
// Use built-in CharacterGrid class
const characterGrid = new CHARACTER_EXAMPLES.CharacterGrid(
  document.getElementById('menuContainer'),
  (key, character) => {
    console.log(`Selected ${character.name} (${character.role})`);
    // Handle selection
  }
);

characterGrid.render();
```

---

## Testing Your Integration

1. **Verify Rendering**
   ```javascript
   const canvas = document.getElementById('gameCanvas');
   const ctx = canvas.getContext('2d');
   ctx.imageSmoothingEnabled = false;

   // Should render without errors
   PIXEL_CHARACTERS.renderCharacter(ctx, 100, 100, 'juan', 0, 0, 2);
   ```

2. **Check Console**
   - No errors should appear
   - Module should load successfully

3. **View Demo**
   - Open `PIXEL_CHARACTERS_DEMO.html` to verify system works
   - Run `PIXEL_CHARACTERS_TEST.html` for full validation

4. **Performance Check**
   - Monitor frame rate
   - Should maintain 60 FPS with multiple animated NPCs

---

## Common Issues & Solutions

### Issue: Character not showing up
**Solution**:
- Verify character key is lowercase: 'juan' not 'Juan'
- Check canvas context is 2D
- Ensure scale parameter is positive (e.g., 2)

### Issue: Animation not smooth
**Solution**:
- Call `animator.update()` every frame
- Ensure `ctx.imageSmoothingEnabled = false`
- Check frame speed isn't too high

### Issue: Performance lag
**Solution**:
- Cache sprite sheets if rendering multiple times
- Only update animators for visible characters
- Use appropriate scale values

---

## Next Steps

1. Decide which integration pattern fits your game
2. Add character system includes to your HTML
3. Choose rooms/areas to display NPCs
4. Add animations where appropriate
5. Implement dialogue/interaction systems
6. Test thoroughly before deploying

For more details, see:
- **PIXEL_CHARACTERS_GUIDE.md** - Full API reference
- **CHARACTER_SYSTEM_EXAMPLES.js** - Ready-to-use classes
- **PIXEL_CHARACTERS_DEMO.html** - Interactive demos

---

**Ready to integrate?** Start with Step 1 above, then refer to the patterns that match your game design!
