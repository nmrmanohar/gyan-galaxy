export const GIRL_THEME = {
  id: 'girl',
  label: 'Fairy Garden',
  emoji: '🧚',

  // Colors
  primary:    '#FF6B9D',
  secondary:  '#C44DFF',
  accent:     '#FFD700',
  background: '#FFF0F8',
  surface:    '#FFE4F3',
  text:       '#5A005A',
  textLight:  '#FF6B9D',
  success:    '#4CAF50',
  error:      '#FF5252',

  // Gradients (start → end)
  bgGradient:   ['#FFE4F3', '#F3E5FF'],
  cardGradient: ['#FF6B9D', '#C44DFF'],

  // FX labels (used to pick sound/animation variants)
  correctFx: 'sparkle',
  wrongFx:   'fairy_wobble',
  levelFx:   'fireworks_tiara',

  // Pet companion
  pet: '🦄',

  // Subject world names
  worlds: {
    math:    'Fairy Bakery',
    english: 'Garden Library',
    telugu:  'Magic Spell Book',
    hindi:   'Rainbow Kingdom',
  },

  // Currency label
  currency: '💎 Gems',
}

export const BOY_THEME = {
  id: 'boy',
  label: 'Vehicle World',
  emoji: '🚂',

  // Colors
  primary:    '#1565C0',
  secondary:  '#F57C00',
  accent:     '#FFD600',
  background: '#E3F2FD',
  surface:    '#BBDEFB',
  text:       '#0D1B2A',
  textLight:  '#1565C0',
  success:    '#43A047',
  error:      '#E53935',

  // Gradients
  bgGradient:   ['#E3F2FD', '#FFF3E0'],
  cardGradient: ['#1565C0', '#0D47A1'],

  // FX labels
  correctFx: 'engine_rev',
  wrongFx:   'horn_honk',
  levelFx:   'checkered_flag',

  // Pet companion
  pet: '🐶',

  // Subject world names
  worlds: {
    math:    'Train Station',
    english: 'Driver License',
    telugu:  'Loco Pilot',
    hindi:   'Highway Signs',
  },

  // Currency label
  currency: '⚙️ Bolts',
}

export const THEMES = {
  girl: GIRL_THEME,
  boy:  BOY_THEME,
}
