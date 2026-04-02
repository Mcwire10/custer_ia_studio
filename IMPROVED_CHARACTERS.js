/**
 * IMPROVED 8-BIT CHARACTERS - More "Normal" & Realistic Style
 * Based on Stardew Valley / Pokémon style - but more professional
 */

const IMPROVED_CHARACTERS = {
  // Base character templates
  baseCharacters: {
    juan: {
      name: 'Juan',
      role: 'Brand Specialist',
      description: 'Strategic thinker, wears smart casual',
      colors: {
        skin: '#c9a877',
        hair: '#3d2817',
        shirt: '#2c5aa0',  // Blue shirt
        pants: '#3d3d3d',  // Gray
        shoes: '#1a1a1a'   // Black
      }
    },
    sofia: {
      name: 'Sofia',
      role: 'Creative Lead',
      description: 'Artistic, colorful personality',
      colors: {
        skin: '#d4a574',
        hair: '#c83e1d',  // Reddish brown
        shirt: '#e84c3d', // Coral
        pants: '#2c2c2c',
        shoes: '#1a1a1a'
      }
    },
    carlos: {
      name: 'Carlos',
      role: 'Data Analyst',
      description: 'Organized, tech-savvy',
      colors: {
        skin: '#c9a877',
        hair: '#4a4a4a',  // Dark brown
        shirt: '#2c2c2c',  // Dark gray
        pants: '#1a1a1a',
        shoes: '#3d3d3d'
      }
    },
    lucia: {
      name: 'Lucia',
      role: 'Copywriter',
      description: 'Creative wordsmith',
      colors: {
        skin: '#d4a574',
        hair: '#ffcc00', // Blonde
        shirt: '#9b4d96', // Purple
        pants: '#2c2c2c',
        shoes: '#1a1a1a'
      }
    },
    marco: {
      name: 'Marco',
      role: 'Researcher',
      description: 'Detail-oriented investigator',
      colors: {
        skin: '#c9a877',
        hair: '#4a4a4a',
        shirt: '#1a5f2d', // Dark green
        pants: '#3d3d3d',
        shoes: '#1a1a1a'
      }
    },
    ana: {
      name: 'Ana',
      role: 'Data Scientist',
      description: 'Numbers expert, cool demeanor',
      colors: {
        skin: '#d4a574',
        hair: '#2c2c2c',  // Black
        shirt: '#1a3a52', // Navy
        pants: '#2c2c2c',
        shoes: '#1a1a1a'
      }
    }
  },

  /**
   * Render simple 8-bit character (32x32 pixels)
   * Canvas 2D based - no external assets
   */
  renderCharacter: function(ctx, x, y, name, scale = 2) {
    const char = this.baseCharacters[name];
    if (!char) return;

    const size = 32 * scale;
    const half = size / 2;

    // Draw simple 8-bit character
    ctx.save();
    ctx.translate(x, y);
    ctx.imageSmoothingEnabled = false;

    // Head
    ctx.fillStyle = char.colors.skin;
    ctx.fillRect(8 * scale, 2 * scale, 16 * scale, 12 * scale);

    // Hair
    ctx.fillStyle = char.colors.hair;
    ctx.fillRect(6 * scale, 1 * scale, 20 * scale, 6 * scale);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10 * scale, 6 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(18 * scale, 6 * scale, 2 * scale, 2 * scale);

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(10 * scale, 6 * scale, 1 * scale, 1 * scale);
    ctx.fillRect(18 * scale, 6 * scale, 1 * scale, 1 * scale);

    // Shirt/Body
    ctx.fillStyle = char.colors.shirt;
    ctx.fillRect(6 * scale, 14 * scale, 20 * scale, 12 * scale);

    // Arms
    ctx.fillStyle = char.colors.skin;
    ctx.fillRect(4 * scale, 15 * scale, 2 * scale, 10 * scale);
    ctx.fillRect(26 * scale, 15 * scale, 2 * scale, 10 * scale);

    // Pants
    ctx.fillStyle = char.colors.pants;
    ctx.fillRect(8 * scale, 26 * scale, 6 * scale, 6 * scale);
    ctx.fillRect(18 * scale, 26 * scale, 6 * scale, 6 * scale);

    // Shoes
    ctx.fillStyle = char.colors.shoes;
    ctx.fillRect(7 * scale, 31 * scale, 8 * scale, 1 * scale);
    ctx.fillRect(17 * scale, 31 * scale, 8 * scale, 1 * scale);

    ctx.restore();
  },

  /**
   * Render character with name label below
   */
  renderWithLabel: function(ctx, x, y, name, scale = 2) {
    this.renderCharacter(ctx, x, y, name, scale);

    const char = this.baseCharacters[name];
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x + (32 * scale / 2), y + (35 * scale));
  },

  /**
   * Get character info
   */
  getInfo: function(name) {
    return this.baseCharacters[name];
  },

  /**
   * Get all characters
   */
  getAllCharacters: function() {
    return Object.keys(this.baseCharacters);
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IMPROVED_CHARACTERS;
}
