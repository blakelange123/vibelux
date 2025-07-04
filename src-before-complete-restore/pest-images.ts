// Pest image library for visual identification
export interface PestImage {
  id: string
  commonName: string
  scientificName: string
  category: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'mite'
  images: {
    adult?: string
    larva?: string
    damage?: string
    closeup?: string
  }
  description: string
  identificationTips: string[]
}

export const pestImageLibrary: PestImage[] = [
  {
    id: 'aphids',
    commonName: 'Aphids',
    scientificName: 'Aphidoidea',
    category: 'insect',
    images: {
      adult: '/images/pests/aphids-adult.jpg',
      damage: '/images/pests/aphids-damage.jpg',
      closeup: '/images/pests/aphids-closeup.jpg'
    },
    description: 'Small, soft-bodied insects that cluster on new growth and undersides of leaves',
    identificationTips: [
      'Usually green, but can be black, brown, red, or white',
      'Pear-shaped body with long antennae',
      'Often found in clusters on new shoots',
      'Produce sticky honeydew that attracts ants'
    ]
  },
  {
    id: 'thrips',
    commonName: 'Thrips',
    scientificName: 'Thysanoptera',
    category: 'insect',
    images: {
      adult: '/images/pests/thrips-adult.jpg',
      damage: '/images/pests/thrips-damage.jpg',
      closeup: '/images/pests/thrips-closeup.jpg'
    },
    description: 'Tiny, slender insects with fringed wings that feed by rasping plant tissue',
    identificationTips: [
      'Very small (1-2mm), elongated body',
      'Yellow, brown, or black coloration',
      'Rapid, darting movement when disturbed',
      'Silver or bronze streaks on leaves from feeding'
    ]
  },
  {
    id: 'spider_mites',
    commonName: 'Spider Mites',
    scientificName: 'Tetranychidae',
    category: 'mite',
    images: {
      adult: '/images/pests/spider-mites-adult.jpg',
      damage: '/images/pests/spider-mites-damage.jpg',
      closeup: '/images/pests/spider-mites-closeup.jpg'
    },
    description: 'Microscopic arachnids that feed on plant cells, causing stippling and webbing',
    identificationTips: [
      'Extremely small, need magnification to see clearly',
      'Red, yellow, or green coloration',
      'Fine webbing on leaves and stems',
      'Stippled, yellowing leaves with tiny white spots'
    ]
  },
  {
    id: 'powdery_mildew',
    commonName: 'Powdery Mildew',
    scientificName: 'Erysiphales',
    category: 'fungal',
    images: {
      damage: '/images/pests/powdery-mildew-damage.jpg',
      closeup: '/images/pests/powdery-mildew-closeup.jpg'
    },
    description: 'Fungal disease appearing as white, powdery coating on leaves and stems',
    identificationTips: [
      'White or gray powdery spots on leaves',
      'Starts on upper leaf surface',
      'Spreads to cover entire leaf',
      'Leaves may curl and become distorted'
    ]
  },
  {
    id: 'whiteflies',
    commonName: 'Whiteflies',
    scientificName: 'Aleyrodidae',
    category: 'insect',
    images: {
      adult: '/images/pests/whiteflies-adult.jpg',
      damage: '/images/pests/whiteflies-damage.jpg',
      closeup: '/images/pests/whiteflies-closeup.jpg'
    },
    description: 'Small white flying insects that feed on plant sap from undersides of leaves',
    identificationTips: [
      'White, moth-like appearance',
      'Found on undersides of leaves',
      'Fly up when plant is disturbed',
      'Leave sticky honeydew on leaves'
    ]
  },
  {
    id: 'fungus_gnats',
    commonName: 'Fungus Gnats',
    scientificName: 'Bradysia spp.',
    category: 'insect',
    images: {
      adult: '/images/pests/fungus-gnats-adult.jpg',
      larva: '/images/pests/fungus-gnats-larva.jpg',
      damage: '/images/pests/fungus-gnats-damage.jpg'
    },
    description: 'Small dark flies whose larvae feed on organic matter and roots in growing media',
    identificationTips: [
      'Small black flies around soil surface',
      'White larvae with black heads in soil',
      'Adults are weak fliers',
      'More common in overwatered conditions'
    ]
  },
  {
    id: 'botrytis',
    commonName: 'Botrytis (Gray Mold)',
    scientificName: 'Botrytis cinerea',
    category: 'fungal',
    images: {
      damage: '/images/pests/botrytis-damage.jpg',
      closeup: '/images/pests/botrytis-closeup.jpg'
    },
    description: 'Fungal disease causing gray, fuzzy mold on flowers, leaves, and stems',
    identificationTips: [
      'Gray or brown fuzzy growth',
      'Affects flowers and wounded tissue first',
      'Spreads in high humidity',
      'Water-soaked spots that turn gray'
    ]
  },
  {
    id: 'root_aphids',
    commonName: 'Root Aphids',
    scientificName: 'Pemphigus spp.',
    category: 'insect',
    images: {
      adult: '/images/pests/root-aphids-adult.jpg',
      damage: '/images/pests/root-aphids-damage.jpg'
    },
    description: 'Aphids that feed on plant roots, causing stunting and yellowing',
    identificationTips: [
      'White, waxy substance on roots',
      'Small white or yellow insects on roots',
      'Plants show nutrient deficiency symptoms',
      'Often associated with ants'
    ]
  },
  {
    id: 'downy_mildew',
    commonName: 'Downy Mildew',
    scientificName: 'Peronosporales',
    category: 'fungal',
    images: {
      damage: '/images/pests/downy-mildew-damage.jpg',
      closeup: '/images/pests/downy-mildew-closeup.jpg'
    },
    description: 'Fungal disease causing yellow patches and fuzzy growth on leaf undersides',
    identificationTips: [
      'Yellow or pale green patches on upper leaf',
      'Fuzzy gray/purple growth on leaf underside',
      'Angular spots limited by leaf veins',
      'Worse in cool, humid conditions'
    ]
  },
  {
    id: 'pythium',
    commonName: 'Pythium Root Rot',
    scientificName: 'Pythium spp.',
    category: 'fungal',
    images: {
      damage: '/images/pests/pythium-damage.jpg',
      closeup: '/images/pests/pythium-roots.jpg'
    },
    description: 'Water mold causing root rot and damping-off in seedlings',
    identificationTips: [
      'Brown, mushy roots',
      'Wilting despite moist soil',
      'Stunted growth',
      'Stem rot at soil line'
    ]
  }
]

// Helper function to get pest images by ID
export function getPestImages(pestId: string): PestImage | undefined {
  return pestImageLibrary.find(pest => pest.id === pestId)
}

// Helper function to get all pests by category
export function getPestsByCategory(category: PestImage['category']): PestImage[] {
  return pestImageLibrary.filter(pest => pest.category === category)
}