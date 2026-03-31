/**
 * PIXEL CHARACTER SYSTEM - PRACTICAL EXAMPLES
 *
 * Ready-to-use implementations for common game scenarios:
 * - Room displays with NPCs
 * - Interactive character selection
 * - Walking NPCs
 * - Dialogue scenes
 * - Character UI panels
 */

// ============================================================================
// EXAMPLE 1: Room Display with Multiple NPCs
// ============================================================================

class RoomDisplay {
  /**
   * Displays a room with multiple NPCs positioned around it
   * @param {HTMLCanvasElement} canvas
   * @param {Array} npcs - Array of { key, outfit, x, y }
   */
  constructor(canvas, npcs = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.npcs = npcs;
    this.ctx.imageSmoothingEnabled = false;
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw room background
    this.drawRoomBackground();

    // Draw NPCs
    this.npcs.forEach((npc) => {
      PIXEL_CHARACTERS.renderCharacterWithLabel(
        this.ctx,
        npc.x,
        npc.y,
        npc.key,
        npc.outfit || 0,
        2
      );
    });
  }

  drawRoomBackground() {
    // Decorative room background
    this.ctx.strokeStyle = '#d1d5db';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);
  }

  addNPC(key, outfit, x, y) {
    this.npcs.push({ key, outfit, x, y });
  }

  removeNPC(index) {
    this.npcs.splice(index, 1);
  }

  clear() {
    this.npcs = [];
  }

  updateNPCPosition(index, x, y) {
    if (this.npcs[index]) {
      this.npcs[index].x = x;
      this.npcs[index].y = y;
    }
  }
}

// Usage:
// const roomDisplay = new RoomDisplay(document.getElementById('gameCanvas'), [
//   { key: 'juan', outfit: 0, x: 100, y: 150 },
//   { key: 'sofia', outfit: 1, x: 300, y: 150 },
// ]);
// roomDisplay.render();

// ============================================================================
// EXAMPLE 2: Character Grid / Selection Menu
// ============================================================================

class CharacterGrid {
  /**
   * Interactive grid of selectable characters
   */
  constructor(container, onSelect = null) {
    this.container = container;
    this.onSelect = onSelect;
    this.selectedCharacter = null;
    this.characters = ['juan', 'sofia', 'carlos', 'lucia', 'marco', 'ana'];
  }

  render() {
    this.container.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    grid.style.gap = '20px';
    grid.style.padding = '20px';

    this.characters.forEach((key) => {
      const item = this.createCharacterItem(key);
      grid.appendChild(item);
    });

    this.container.appendChild(grid);
  }

  createCharacterItem(key) {
    const character = PIXEL_CHARACTERS.CHARACTERS[key];

    const item = document.createElement('div');
    item.style.cursor = 'pointer';
    item.style.textAlign = 'center';
    item.style.padding = '10px';
    item.style.borderRadius = '8px';
    item.style.border = '2px solid #e5e7eb';
    item.style.transition = 'all 0.3s';

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    PIXEL_CHARACTERS.renderCharacter(ctx, 32, 32, key, 0, 0, 2);

    // Name
    const name = document.createElement('div');
    name.style.fontWeight = 'bold';
    name.style.marginTop = '8px';
    name.style.fontSize = '0.9em';
    name.textContent = character.name;

    // Role
    const role = document.createElement('div');
    role.style.fontSize = '0.8em';
    role.style.color = '#666';
    role.textContent = character.role;

    // Hover effect
    item.onmouseover = () => {
      item.style.backgroundColor = '#f3f4f6';
      item.style.transform = 'scale(1.05)';
    };

    item.onmouseout = () => {
      item.style.backgroundColor = 'transparent';
      item.style.transform = 'scale(1)';
    };

    // Click handler
    item.onclick = () => {
      this.selectCharacter(key);
    };

    item.appendChild(canvas);
    item.appendChild(name);
    item.appendChild(role);

    return item;
  }

  selectCharacter(key) {
    this.selectedCharacter = key;

    if (this.onSelect) {
      this.onSelect(key, PIXEL_CHARACTERS.CHARACTERS[key]);
    }
  }

  getSelected() {
    return this.selectedCharacter;
  }
}

// Usage:
// const grid = new CharacterGrid(document.getElementById('gridContainer'), (key, char) => {
//   console.log(`Selected: ${char.name}`);
// });
// grid.render();

// ============================================================================
// EXAMPLE 3: Walking NPC Class
// ============================================================================

class WalkingNPC {
  /**
   * NPC that can walk and idle with animation
   */
  constructor(key, startX, startY, outfit = 0) {
    this.key = key;
    this.x = startX;
    this.y = startY;
    this.outfit = outfit;
    this.animator = new PIXEL_CHARACTERS.AnimationController(key, outfit);

    this.vx = 0; // Velocity X
    this.vy = 0; // Velocity Y
    this.speed = 1;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;

    if (vx !== 0 || vy !== 0) {
      this.animator.startWalking();
    } else {
      this.animator.stopWalking();
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime = 16) {
    // Update position
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;

    // Update animation
    this.animator.update();
  }

  render(ctx) {
    const frame = this.animator.getCurrentFrame();
    PIXEL_CHARACTERS.renderCharacter(ctx, this.x, this.y, this.key, this.outfit, frame, 2);
  }

  moveTo(targetX, targetY, speed = 1) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      this.setVelocity(0, 0);
      this.x = targetX;
      this.y = targetY;
    } else {
      const angle = Math.atan2(dy, dx);
      this.setVelocity(Math.cos(angle), Math.sin(angle));
    }
  }

  idle() {
    this.setVelocity(0, 0);
  }

  getCharacterInfo() {
    return PIXEL_CHARACTERS.CHARACTERS[this.key];
  }
}

// Usage:
// const juan = new WalkingNPC('juan', 100, 100);
//
// function gameLoop() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   juan.update();
//   juan.render(ctx);
//   requestAnimationFrame(gameLoop);
// }
//
// juan.moveTo(300, 200);

// ============================================================================
// EXAMPLE 4: Dialogue Scene with Character
// ============================================================================

class DialogueScene {
  /**
   * Display a character with dialogue text
   */
  constructor(canvas, characterKey, outfit = 0) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.characterKey = characterKey;
    this.outfit = outfit;
    this.dialogueText = '';
    this.dialogueIndex = 0;
    this.typingSpeed = 0.1; // Characters per frame

    this.ctx.imageSmoothingEnabled = false;
  }

  setDialogue(text) {
    this.dialogueText = text;
    this.dialogueIndex = 0;
  }

  update(deltaTime = 16) {
    const charsPerFrame = (this.typingSpeed * deltaTime) / 16;
    this.dialogueIndex = Math.min(
      this.dialogueIndex + charsPerFrame,
      this.dialogueText.length
    );
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw character on left
    PIXEL_CHARACTERS.renderCharacter(this.ctx, 50, 100, this.characterKey, this.outfit, 0, 3);

    // Draw character name and role
    const character = PIXEL_CHARACTERS.CHARACTERS[this.characterKey];
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(character.name, 350, 50);

    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(character.role, 350, 70);

    // Draw dialogue box
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(340, 100, this.canvas.width - 360, 150);

    // Draw dialogue text with typing effect
    this.ctx.fillStyle = '#333';
    this.ctx.font = '14px Arial';
    const displayedText = this.dialogueText.substring(0, Math.ceil(this.dialogueIndex));
    this.drawWrappedText(displayedText, 360, 120, this.canvas.width - 380);
  }

  drawWrappedText(text, x, y, maxWidth) {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    const lineHeight = 20;

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        this.ctx.fillText(line, x, lineY);
        line = word + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    });

    this.ctx.fillText(line, x, lineY);
  }

  isFinished() {
    return this.dialogueIndex >= this.dialogueText.length;
  }
}

// Usage:
// const dialogue = new DialogueScene(canvas, 'sofia', 1);
// dialogue.setDialogue("Hello! I'm Sofia, the Creative Lead. I help generate amazing brand concepts!");
//
// function gameLoop() {
//   dialogue.update();
//   dialogue.render();
//   requestAnimationFrame(gameLoop);
// }

// ============================================================================
// EXAMPLE 5: Character Selection Panel
// ============================================================================

class CharacterPanel {
  /**
   * Detailed character info panel with outfit selector
   */
  constructor(container, characterKey) {
    this.container = container;
    this.characterKey = characterKey;
    this.selectedOutfit = 0;
    this.render();
  }

  render() {
    const character = PIXEL_CHARACTERS.CHARACTERS[this.characterKey];
    const outfits = PIXEL_CHARACTERS.getOutfits(this.characterKey);

    this.container.innerHTML = `
      <div style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea; margin-bottom: 15px;">${character.name}</h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <canvas id="panel-canvas" width="160" height="160" style="
              border: 2px solid #e5e7eb;
              border-radius: 6px;
              width: 160px;
              height: 160px;
            "></canvas>
          </div>

          <div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #333;">Role:</strong> ${character.role}
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #333;">Room:</strong> ${character.room}
            </div>
            <div style="margin-bottom: 12px;">
              <strong style="color: #333;">Personality:</strong> ${character.personality}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: bold; margin-bottom: 8px;">Outfit:</label>
          <div style="display: flex; gap: 8px;">
            ${outfits
              .map(
                (outfit, idx) => `
              <button
                onclick="changeOutfit(${idx})"
                style="
                  padding: 8px 12px;
                  border: 2px solid ${this.selectedOutfit === idx ? '#667eea' : '#ddd'};
                  background: ${this.selectedOutfit === idx ? '#667eea' : 'white'};
                  color: ${this.selectedOutfit === idx ? 'white' : '#333'};
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: bold;
                "
              >
                ${outfit.name}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    // Draw character
    const canvas = document.getElementById('panel-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      PIXEL_CHARACTERS.renderCharacter(ctx, 64, 64, this.characterKey, this.selectedOutfit, 0, 3);
    }

    // Attach outfit change handler
    window.changeOutfit = (outfitIdx) => {
      this.selectedOutfit = outfitIdx;
      this.render();
    };
  }
}

// Usage:
// new CharacterPanel(document.getElementById('panelContainer'), 'carlos');

// ============================================================================
// EXAMPLE 6: Team/Party Display
// ============================================================================

class TeamDisplay {
  /**
   * Display a team of characters in a grid
   */
  constructor(canvas, teamMembers = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.teamMembers = teamMembers; // Array of { key, outfit, name }
    this.ctx.imageSmoothingEnabled = false;
  }

  addMember(key, outfit = 0) {
    const character = PIXEL_CHARACTERS.CHARACTERS[key];
    this.teamMembers.push({
      key,
      outfit,
      name: character.name,
      role: character.role,
    });
  }

  removeMember(index) {
    this.teamMembers.splice(index, 1);
  }

  render() {
    const cellWidth = 150;
    const cellHeight = 150;
    const cols = Math.floor(this.canvas.width / cellWidth);

    // Clear canvas
    this.ctx.fillStyle = '#f9fafb';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;

    this.teamMembers.forEach((member, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = col * cellWidth;
      const y = row * cellHeight;

      // Draw cell border
      this.ctx.strokeRect(x, y, cellWidth, cellHeight);

      // Draw character
      const charX = x + cellWidth / 2 - 32;
      const charY = y + 20;
      PIXEL_CHARACTERS.renderCharacter(
        this.ctx,
        charX,
        charY,
        member.key,
        member.outfit,
        0,
        2
      );

      // Draw name and role
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(member.name, x + cellWidth / 2, y + cellHeight - 30);

      this.ctx.fillStyle = '#666';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(member.role, x + cellWidth / 2, y + cellHeight - 15);
    });
  }
}

// Usage:
// const team = new TeamDisplay(document.getElementById('teamCanvas'));
// team.addMember('juan', 0);
// team.addMember('sofia', 1);
// team.addMember('carlos', 0);
// team.render();

// ============================================================================
// UTILITY: Export all classes
// ============================================================================

const CHARACTER_EXAMPLES = {
  RoomDisplay,
  CharacterGrid,
  WalkingNPC,
  DialogueScene,
  CharacterPanel,
  TeamDisplay,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHARACTER_EXAMPLES;
}

if (typeof window !== 'undefined') {
  window.CHARACTER_EXAMPLES = CHARACTER_EXAMPLES;
}
