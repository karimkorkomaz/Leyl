// All copy and brand data lives here so text can change without touching components.

export const brand = {
  name: 'LEYL',
  arabic: 'ليل',
  meaning: 'night',
  origin: 'Beirut',
  tagline: 'Wear the night.',
  product: 'Eau de Parfum',
  volume: '50 ml',
  price: '$185',
} as const

export const nav = [
  { label: 'Editions', href: '#editions' },
  { label: 'The Notes', href: '#notes' },
  { label: 'Discover', href: '#finale' },
] as const

export type EditionId = 'anbar' | 'ward' | 'dukhan'
export type StageId = 'top' | 'heart' | 'base'

export type Edition = {
  id: EditionId
  name: string
  arabic: string
  /** Liquid color, sRGB hex. Mirrored as --anbar / --ward / --dukhan in tokens.css. */
  color: string
  mood: string
  line: string
  notes: Record<StageId, readonly string[]>
}

export const editions: readonly Edition[] = [
  {
    id: 'anbar',
    name: 'Anbar',
    arabic: 'عنبر',
    color: '#C8782A',
    mood: 'Warm, golden, slow',
    line: 'Warm stone after sunset.',
    notes: {
      top: ['Bergamot', 'Saffron'],
      heart: ['Labdanum', 'Honey'],
      base: ['Amber', 'Vanilla', 'Cedar'],
    },
  },
  {
    id: 'ward',
    name: 'Ward',
    arabic: 'ورد',
    color: '#8E2A3E',
    mood: 'Romantic, velvet',
    line: 'Roses on a balcony, past midnight.',
    notes: {
      top: ['Pink pepper', 'Lychee'],
      heart: ['Damask rose'],
      base: ['Oud', 'White musk'],
    },
  },
  {
    id: 'dukhan',
    name: 'Dukhan',
    arabic: 'دخان',
    color: '#3E5A78',
    mood: 'Cool, mysterious',
    line: 'Incense drifting from old streets.',
    notes: {
      top: ['Cardamom', 'Black pepper'],
      heart: ['Frankincense', 'Iris'],
      base: ['Vetiver', 'Smoked cedar'],
    },
  },
]

export const defaultEdition: EditionId = 'anbar'

export const stages: readonly { id: StageId; label: string; numeral: string }[] = [
  { id: 'top', label: 'Top', numeral: '01' },
  { id: 'heart', label: 'Heart', numeral: '02' },
  { id: 'base', label: 'Base', numeral: '03' },
]

export type CalloutId = 'base' | 'cap' | 'volume'

/** The Flacon's three callouts, in the order they appear. Title is set in serif, body in sans. */
export const callouts: readonly { id: CalloutId; title: string; body: string }[] = [
  { id: 'base', title: 'Cast glass.', body: 'A 9 mm base that holds the light.' },
  { id: 'cap', title: 'Hand-polished cap.', body: 'Weighted, cool to the touch.' },
  { id: 'volume', title: '50 ml.', body: 'Eau de Parfum.' },
]

export const credits = {
  concept: 'A concept by Ahmad El Amine',
  model: {
    text: 'Perfume Bottle 3D model by lamborado, CC BY 4.0',
    href: 'https://sketchfab.com/3d-models/perfume-bottle-e263d9953f67444f8fa89530474126b4',
    licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
  },
} as const
