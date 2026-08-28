import { AdditiveKnowledge } from '../types.js';

export const PRESERVATIVES: AdditiveKnowledge[] = [
  {
    insNumber: '211',
    insCode: 'INS 211',
    canonicalName: 'Sodium Benzoate',
    aliases: ['211', 'ins211', 'ins 211', 'e211', 'e-211', 'sodium benzoate', 'benzoate of soda'],
    functionalClass: 'preservative',
    riskCategory: 'caution_load',
    neutralExplanation: 'Chemical preservative widely used in acidic foods (carbonated soft drinks, fruit juices, pickles) to inhibit mold and yeast growth.',
    fssaiMaxPermittedNote: 'Class II preservative; max limits specified per product category under FSSAI (e.g. 120-600 ppm).',
    sourceRefs: ['FSSAI Food Additives Table 2', 'JECFA Monograph']
  },
  {
    insNumber: '202',
    insCode: 'INS 202',
    canonicalName: 'Potassium Sorbate',
    aliases: ['202', 'ins202', 'ins 202', 'e202', 'e-202', 'potassium sorbate', 'sorbate of potassium'],
    functionalClass: 'preservative',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Potassium salt of sorbic acid used to inhibit molds and yeasts in cheeses, baked foods, jams, and dips.',
    fssaiMaxPermittedNote: 'Class II preservative under FSSAI.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '224',
    insCode: 'INS 224',
    canonicalName: 'Potassium Metabisulphite',
    aliases: ['224', 'ins224', 'ins 224', 'e224', 'e-224', 'potassium metabisulphite', 'kms'],
    functionalClass: 'preservative',
    riskCategory: 'caution_load',
    neutralExplanation: 'Sulphite preservative and antioxidant used in fruit squashes, pulps, and dried fruits to prevent browning and microbial spoilage.',
    fssaiMaxPermittedNote: 'Class II preservative; sulphites require allergen caution for sensitive individuals.',
    sourceRefs: ['FSSAI Standards Table 2']
  },
  {
    insNumber: '282',
    insCode: 'INS 282',
    canonicalName: 'Calcium Propionate',
    aliases: ['282', 'ins282', 'ins 282', 'e282', 'e-282', 'calcium propionate', 'calcium propanoate'],
    functionalClass: 'preservative',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Organic calcium salt used in commercial breads and bakery goods to prevent mold formation and rope spoilage.',
    fssaiMaxPermittedNote: 'Permitted in bread and bakery products up to 0.5% (5000 ppm) under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.4.15']
  }
];
