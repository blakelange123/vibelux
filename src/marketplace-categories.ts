export interface ProduceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
  description: string;
  seasonality?: string[];
  typicalUnits: string[];
  shelfLifeRange: { min: number; max: number };
}

export const produceCategories: ProduceCategory[] = [
  // Leafy Greens
  {
    id: 'leafy-greens',
    name: 'Leafy Greens',
    icon: '🥬',
    description: 'Fresh lettuce, spinach, kale, and other greens',
    subcategories: [
      'Buttercrunch Lettuce',
      'Romaine Lettuce',
      'Iceberg Lettuce',
      'Mixed Greens',
      'Spinach',
      'Kale',
      'Arugula',
      'Swiss Chard',
      'Collard Greens',
      'Mustard Greens',
      'Bok Choy',
      'Watercress'
    ],
    typicalUnits: ['heads', 'bunches', 'lbs', 'cases'],
    shelfLifeRange: { min: 7, max: 14 }
  },

  // Tomatoes
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    icon: '🍅',
    description: 'Fresh tomatoes of all varieties',
    subcategories: [
      'Cherry Tomatoes',
      'Grape Tomatoes',
      'Roma Tomatoes',
      'Beefsteak Tomatoes',
      'Heirloom Tomatoes',
      'Cocktail Tomatoes',
      'Green Tomatoes',
      'San Marzano'
    ],
    typicalUnits: ['lbs', 'flats', 'cases', 'pints'],
    shelfLifeRange: { min: 7, max: 21 }
  },

  // Herbs
  {
    id: 'herbs',
    name: 'Fresh Herbs',
    icon: '🌿',
    description: 'Aromatic herbs for culinary use',
    subcategories: [
      'Basil',
      'Cilantro',
      'Parsley',
      'Mint',
      'Rosemary',
      'Thyme',
      'Oregano',
      'Sage',
      'Chives',
      'Dill',
      'Tarragon',
      'Bay Leaves'
    ],
    typicalUnits: ['bunches', 'oz', 'lbs', 'cases'],
    shelfLifeRange: { min: 5, max: 14 }
  },

  // Floriculture
  {
    id: 'floriculture',
    name: 'Floriculture',
    icon: '🌸',
    description: 'Cut flowers, potted plants, and ornamentals',
    subcategories: [
      'Roses',
      'Tulips',
      'Orchids',
      'Lilies',
      'Gerbera Daisies',
      'Chrysanthemums',
      'Carnations',
      'Sunflowers',
      'Hydrangeas',
      'Peonies',
      'Snapdragons',
      'Potted Orchids',
      'Potted Herbs',
      'Succulents',
      'Ferns',
      'Peace Lilies'
    ],
    typicalUnits: ['stems', 'bunches', 'pots', 'cases'],
    shelfLifeRange: { min: 7, max: 14 }
  },

  // Berries
  {
    id: 'berries',
    name: 'Berries',
    icon: '🍓',
    description: 'Fresh strawberries, blueberries, and more',
    subcategories: [
      'Strawberries',
      'Blueberries',
      'Raspberries',
      'Blackberries',
      'Gooseberries',
      'Cranberries'
    ],
    typicalUnits: ['pints', 'flats', 'lbs', 'cases'],
    shelfLifeRange: { min: 3, max: 7 }
  },

  // Peppers
  {
    id: 'peppers',
    name: 'Peppers',
    icon: '🌶️',
    description: 'Sweet and hot pepper varieties',
    subcategories: [
      'Bell Peppers',
      'Sweet Peppers',
      'Jalapeños',
      'Habaneros',
      'Serranos',
      'Thai Chilies',
      'Ghost Peppers',
      'Banana Peppers',
      'Poblanos',
      'Shishito'
    ],
    typicalUnits: ['lbs', 'bushels', 'cases'],
    shelfLifeRange: { min: 10, max: 21 }
  },

  // Cucumbers & Squash
  {
    id: 'cucumbers-squash',
    name: 'Cucumbers & Squash',
    icon: '🥒',
    description: 'Fresh cucumbers, zucchini, and squash varieties',
    subcategories: [
      'English Cucumbers',
      'Persian Cucumbers',
      'Pickling Cucumbers',
      'Zucchini',
      'Yellow Squash',
      'Butternut Squash',
      'Acorn Squash',
      'Spaghetti Squash',
      'Pattypan Squash'
    ],
    typicalUnits: ['lbs', 'cases', 'bushels'],
    shelfLifeRange: { min: 7, max: 14 }
  },

  // Microgreens
  {
    id: 'microgreens',
    name: 'Microgreens',
    icon: '🌱',
    description: 'Nutrient-dense baby greens',
    subcategories: [
      'Pea Shoots',
      'Sunflower Shoots',
      'Radish Microgreens',
      'Broccoli Microgreens',
      'Arugula Microgreens',
      'Beet Microgreens',
      'Kale Microgreens',
      'Mustard Microgreens',
      'Cilantro Microgreens',
      'Basil Microgreens'
    ],
    typicalUnits: ['oz', 'lbs', 'trays', 'cases'],
    shelfLifeRange: { min: 5, max: 10 }
  },

  // Mushrooms
  {
    id: 'mushrooms',
    name: 'Mushrooms',
    icon: '🍄',
    description: 'Specialty and culinary mushrooms',
    subcategories: [
      'Button Mushrooms',
      'Portobello',
      'Shiitake',
      'Oyster Mushrooms',
      'Lion\'s Mane',
      'Maitake',
      'King Oyster',
      'Enoki',
      'Chanterelles',
      'Morels'
    ],
    typicalUnits: ['lbs', 'cases', 'flats'],
    shelfLifeRange: { min: 7, max: 14 }
  },

  // Root Vegetables
  {
    id: 'root-vegetables',
    name: 'Root Vegetables',
    icon: '🥕',
    description: 'Carrots, radishes, and other root crops',
    subcategories: [
      'Carrots',
      'Radishes',
      'Turnips',
      'Beets',
      'Parsnips',
      'Rutabagas',
      'Ginger',
      'Turmeric',
      'Horseradish'
    ],
    typicalUnits: ['lbs', 'bunches', 'cases'],
    shelfLifeRange: { min: 14, max: 30 }
  },

  // Specialty Produce
  {
    id: 'specialty',
    name: 'Specialty Produce',
    icon: '✨',
    description: 'Unique and exotic varieties',
    subcategories: [
      'Edible Flowers',
      'Baby Vegetables',
      'Heirloom Varieties',
      'Asian Vegetables',
      'Tropical Greens',
      'Specialty Melons',
      'Exotic Herbs',
      'Rare Varietals'
    ],
    typicalUnits: ['varies'],
    shelfLifeRange: { min: 3, max: 14 }
  }
];

// Certification options
export const certificationOptions = [
  'USDA Organic',
  'GAP Certified',
  'SQF Level 2',
  'Non-GMO Project',
  'Rainforest Alliance',
  'Fair Trade',
  'GlobalGAP',
  'Local Harvest',
  'Demeter Biodynamic',
  'Certified Naturally Grown',
  'Real Organic Project',
  'ROC (Regenerative Organic Certified)'
];

// Growing methods
export const growingMethods = [
  { id: 'hydroponic', name: 'Hydroponic', description: 'Soil-free, nutrient solution' },
  { id: 'aeroponic', name: 'Aeroponic', description: 'Misted root systems' },
  { id: 'aquaponic', name: 'Aquaponic', description: 'Fish & plant symbiosis' },
  { id: 'vertical', name: 'Vertical Farming', description: 'Stacked growing systems' },
  { id: 'greenhouse', name: 'Greenhouse', description: 'Climate-controlled' },
  { id: 'indoor', name: 'Indoor Farm', description: 'Fully enclosed facility' },
  { id: 'soil', name: 'Soil-based', description: 'Traditional growing medium' }
];

// State/region options for filtering
export const stateOptions = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'CO', name: 'Colorado' },
  { code: 'OH', name: 'Ohio' },
  { code: 'MI', name: 'Michigan' },
  { code: 'IL', name: 'Illinois' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'WA', name: 'Washington' },
  { code: 'OR', name: 'Oregon' },
  { code: 'NV', name: 'Nevada' }
];

// Price ranges for filtering
export const priceRanges = [
  { id: 'under-5', label: 'Under $5', min: 0, max: 5 },
  { id: '5-10', label: '$5 - $10', min: 5, max: 10 },
  { id: '10-20', label: '$10 - $20', min: 10, max: 20 },
  { id: '20-50', label: '$20 - $50', min: 20, max: 50 },
  { id: 'over-50', label: 'Over $50', min: 50, max: 999999 }
];

// Delivery radius options
export const deliveryRadiusOptions = [
  { value: 10, label: 'Within 10 miles' },
  { value: 25, label: 'Within 25 miles' },
  { value: 50, label: 'Within 50 miles' },
  { value: 100, label: 'Within 100 miles' },
  { value: 999, label: 'Any distance' }
];

// Sorting options
export const sortingOptions = [
  { id: 'nearest', label: 'Nearest First', icon: '📍' },
  { id: 'price-low', label: 'Price: Low to High', icon: '💵' },
  { id: 'price-high', label: 'Price: High to Low', icon: '💰' },
  { id: 'freshest', label: 'Freshest First', icon: '🌱' },
  { id: 'rating', label: 'Highest Rated', icon: '⭐' },
  { id: 'popular', label: 'Most Popular', icon: '🔥' }
];