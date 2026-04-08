# 🎨 Custer Design Skill

Generate professional visual content with complete brand identity integration.

## What it does

Generates high-quality SVG/HTML designs that automatically apply:
- Brand colors (primary, secondary, accents)
- Typography (family, weights, golden ratio sizing)
- Visual elements (icons, patterns, graphics)
- Design system (style, resources, composition rules)
- Emotional tone (voz, tono, registro)

## Inputs

```javascript
{
  brand: {
    nombre: string,
    color_primario: string,      // #6860EE
    color_secundario: string,    // #F5A623
    acentos: string[],
    tipografia_principal: string, // Gotham
    estilo_visual: string,        // moderno, clásico, minimalista
    recursos_graficos: string,    // iconos, formas, patrones
    voz_tono: string,
    registro: string,
    tonalidad: string[]
  },
  content: {
    titulo: string,
    texto: string,
    subtitulo?: string,
    cta?: string
  },
  type: 'post' | 'story' | 'carousel' | 'banner' | 'mockup',
  style?: 'awareness' | 'consideration' | 'conversion'
}
```

## Outputs

Professional SVG/HTML designs with:
- ✅ Correct brand colors applied
- ✅ Typography with golden ratio (9pt → 14.562pt → 23.56pt)
- ✅ Graphical elements and patterns
- ✅ Professional composition
- ✅ Accessible and responsive
- ✅ Ready to export/publish

## Examples

### Instagram Post (1080x1080)
```
Generates: Gradient background with brand colors → Typography hierarchy
→ Visual elements (icons, shapes) → CTA button → Professional layout
```

### Story (1080x1920)
```
Generates: Full-screen vertical design → Bold typography →
Elements distributed for visual balance → CTA at bottom
```

### Carousel Slide
```
Generates: Sequential slide with narrative flow →
Consistent branding across slides → Clear visual hierarchy
```

## Design Principles

1. **Brand Consistency**: Every element respects brand guidelines
2. **Visual Hierarchy**: Title (23.56px Bold) → Subtitle (14.562px) → Body (9px)
3. **Color Psychology**: Primary for CTA, secondary for accents, accents for details
4. **Composition**: Golden ratio spacing, asymmetric layouts, negative space
5. **Emotion**: Style and tone aligned with marketing funnel stage

## Integration

### In Generator
```javascript
const design = await useSkill('custer-design', {
  brand: currentBrand,
  content: { titulo, texto, cta },
  type: 'post'
})
// Returns: SVG/HTML string ready to display
```

### In Validator
```javascript
const mockup = await useSkill('custer-design', {
  brand: currentBrand,
  content: { titulo: slide.titulo, texto: slide.contenido_mejorado },
  type: 'mockup',
  style: validation.funnelStage
})
// Returns: Professional slide mockup with branding
```

## Features

- 🎨 Dynamic color application
- 📐 Golden ratio typography
- ✨ Automatic element placement
- 🎯 Funnel stage optimization
- 📱 Responsive design
- 🔄 Multi-format support (post, story, banner, carousel)
- 💾 Brand memory (reads from localStorage)
- 🎭 Emotional tone integration

## No credentials required

This skill works with your loaded brands and doesn't require external APIs. It generates SVG/HTML client-side or via Claude API.

---

**Created for Custer AI Studio**
*Making professional design accessible with AI*
