export function validateBarcodeChecksum(code: string | null | undefined): boolean {
  if (!code || typeof code !== 'string') return false;
  const num = code.replace(/[^0-9]/g, '');
  if (num.length !== 8 && num.length !== 12 && num.length !== 13 && num.length !== 14) return false;
  
  const padded = num.padStart(14, '0');
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(padded[i], 10) * (i % 2 === 0 ? 3 : 1);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(padded[13], 10) === checkDigit;
}

export const INCLUDED_FOOD_CATEGORIES = [
  'snack', 'chip', 'namkeen', 'popcorn', 'makhana', 'biscuit', 'cookie', 'rusk',
  'beverage', 'juice', 'drink', 'dairy', 'yogurt', 'cheese', 'ghee',
  'bakery', 'bread', 'cake', 'chocolate', 'confectionery', 'cereal', 'oat',
  'muesli', 'granola', 'noodle', 'pasta', 'vermicelli', 'ready-to-eat',
  'frozen', 'sauce', 'ketchup', 'mayonnaise', 'spread', 'jam', 'pickle',
  'chutney', 'spice', 'masala', 'seasoning', 'rice', 'atta', 'flour', 'poha',
  'millet', 'cooking oil', 'staple', 'bar', 'candy', 'sweet'
];

export const EXCLUDED_CATEGORIES = [
  'cosmetic', 'skincare', 'personal care', 'cleaning', 'household', 'electronics',
  'medicine', 'pharmaceutical', 'non-food', 'pet food', 'pet-food', 'baby-care',
  'clothing', 'toy', 'furniture', 'stationery', 'retail', 'dog', 'cat', 'shampoo',
  'soap', 'detergent', 'supplement', 'vitamin'
];

export const TARGET_CATEGORIES = [
  'snack', 'biscuit', 'cookie', 'rusk', 'beverage', 'juice', 'drink', 'chocolate',
  'confectionery', 'sweet', 'noodle', 'pasta', 'cereal', 'oat', 'dairy', 'cheese',
  'bakery', 'bread', 'sauce', 'ketchup', 'frozen', 'pickle', 'spice', 'masala',
  'rice', 'flour', 'oil', 'protein', 'ready-to-eat'
];

export function matchesTargetCategory(cat: string | null | undefined): boolean {
  if (!cat) return false;
  const lower = cat.toLowerCase();
  return TARGET_CATEGORIES.some(t => lower.includes(t));
}

export function isFoodProduct(categories: string | null | undefined): boolean {
  if (!categories) return false;
  const lower = categories.toLowerCase();
  
  for (const ex of EXCLUDED_CATEGORIES) {
    if (lower.includes(ex)) return false;
  }
  
  for (const inc of INCLUDED_FOOD_CATEGORIES) {
    if (lower.includes(inc)) return true;
  }
  
  return false;
}

export function classifyDataQuality(p: {
  code: string;
  productName?: string;
  ingredients?: string;
  nutrition?: any;
}): 'analysis_ready' | 'partial_data' | 'identity_only' {
  if (!validateBarcodeChecksum(p.code)) return 'identity_only';
  if (!p.productName || p.productName.trim() === '') return 'identity_only';

  const hasIngredients = isMeaningfulText(p.ingredients);
  const hasSufficientNutrition = hasMeaningfulNutrition(p.nutrition);

  if (hasIngredients && hasSufficientNutrition) {
    return 'analysis_ready';
  }

  if (hasIngredients || hasSufficientNutrition) {
    return 'partial_data';
  }

  return 'identity_only';
}

function isMeaningfulText(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  if (t === '' || t === 'null' || t === 'unknown' || t === 'n/a' || t === 'na') return false;
  return t.length > 3; // Basic check for meaningful length
}

function hasMeaningfulNutrition(nut: any): boolean {
  if (!nut || typeof nut !== 'object') return false;
  
  const requiredFields = [
    'energy-kcal_100g',
    'fat_100g',
    'saturated-fat_100g',
    'carbohydrates_100g',
    'sugars_100g',
    'proteins_100g',
    'fiber_100g'
  ];
  
  // Alternative fields that are acceptable
  const altFields = {
    'energy-kcal_100g': ['energy_100g'],
    'sodium_100g': ['salt_100g']
  };

  let count = 0;
  for (const field of requiredFields) {
    if (typeof nut[field] === 'number') {
      count++;
    } else if (altFields[field as keyof typeof altFields]) {
      for (const alt of altFields[field as keyof typeof altFields]) {
        if (typeof nut[alt] === 'number') {
          count++;
          break;
        }
      }
    }
  }
  
  // Also check sodium/salt independently as it's highly requested
  if (typeof nut['sodium_100g'] === 'number' || typeof nut['salt_100g'] === 'number') {
    count++;
  }

  // Expect at least 5 meaningful macro fields out of 8
  return count >= 5;
}
