import { IngredientKnowledge } from '../types.js';

export const DAIRY_INGREDIENTS: IngredientKnowledge[] = [
  {
    id: 'milk_solids',
    canonicalName: 'Milk Solids',
    aliases: ['milk solids', 'skimmed milk powder', 'whole milk powder', 'dairy whitener', 'toned milk', 'cow milk', 'buffalo milk', 'condensed milk', 'milk'],
    category: 'dairy',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: true,
    allergenType: 'milk',
    description: 'Dehydrated or concentrated milk components providing high biological value dairy protein and calcium.',
    sourceRefs: ['FSSAI Standards 2.1.1', '2.1.10']
  },
  {
    id: 'whey_protein',
    canonicalName: 'Whey Protein / Whey Solids',
    aliases: ['whey', 'whey powder', 'whey protein concentrate', 'whey protein isolate', 'demineralized whey powder', 'whey solids'],
    category: 'dairy',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: true,
    allergenType: 'milk',
    description: 'High quality dairy protein byproduct of cheese/paneer manufacture, rich in branched-chain amino acids (BCAAs).',
    sourceRefs: ['FSSAI Standards 2.1.19']
  },
  {
    id: 'paneer',
    canonicalName: 'Paneer (Cottage Cheese)',
    aliases: ['paneer', 'cottage cheese', 'chenna', 'fresh paneer'],
    category: 'dairy',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: true,
    allergenType: 'milk',
    description: 'Traditional unaged, non-melting Indian acid-set curd cheese rich in protein and calcium.',
    sourceRefs: ['FSSAI Standards 2.1.16']
  },
  {
    id: 'curd',
    canonicalName: 'Curd (Dahi / Yogurt)',
    aliases: ['curd', 'dahi', 'yogurt', 'plain dahi', 'probiotic dahi'],
    category: 'dairy',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: true,
    allergenType: 'milk',
    description: 'Traditional fermented milk product providing gut-friendly lactic acid cultures and bioavailable calcium.',
    sourceRefs: ['FSSAI Standards 2.1.12']
  },
  {
    id: 'casein',
    canonicalName: 'Casein / Caseinates',
    aliases: ['casein', 'sodium caseinate', 'calcium caseinate', 'milk casein'],
    category: 'dairy',
    isWholeGrain: false,
    isRefinedGrain: false,
    isUltraProcessedMarker: false,
    isPositiveMarker: true,
    allergenType: 'milk',
    description: 'Primary slow-digesting protein fraction found in mammalian milk.',
    sourceRefs: ['FSSAI Standards 2.1.20']
  }
];
