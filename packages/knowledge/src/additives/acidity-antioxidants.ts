import { AdditiveKnowledge } from '../types.js';

export const ACIDITY_ANTIOXIDANTS: AdditiveKnowledge[] = [
  {
    insNumber: '300',
    insCode: 'INS 300',
    canonicalName: 'Ascorbic Acid (Vitamin C)',
    aliases: ['300', 'ins300', 'ins 300', 'e300', 'e-300', 'ascorbic acid', 'vitamin c', 'l-ascorbic acid'],
    functionalClass: 'antioxidant',
    riskCategory: 'neutral',
    neutralExplanation: 'Natural water-soluble antioxidant and essential nutrient (Vitamin C) used to prevent oxidation and browning.',
    fssaiMaxPermittedNote: 'Permitted under GMP in fruit juices, flours, and fats.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '319',
    insCode: 'INS 319',
    canonicalName: 'Tertiary Butylhydroquinone (TBHQ)',
    aliases: ['319', 'ins319', 'ins 319', 'e319', 'e-319', 'tbhq', 'tertiary butylhydroquinone'],
    functionalClass: 'antioxidant',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Synthetic aromatic antioxidant used to prevent rancidity in vegetable oils and high-fat fried snacks.',
    fssaiMaxPermittedNote: 'Permitted up to 200 mg/kg in edible oils and fats under FSSAI.',
    sourceRefs: ['FSSAI Standards Table 3', 'JECFA']
  },
  {
    insNumber: '330',
    insCode: 'INS 330',
    canonicalName: 'Citric Acid',
    aliases: ['330', 'ins330', 'ins 330', 'e330', 'e-330', 'citric acid', 'citric acid anhydrous'],
    functionalClass: 'acidity_regulator',
    riskCategory: 'neutral',
    neutralExplanation: 'Naturally occurring organic fruit acid used as an acidity regulator, tartness enhancer, and synergist for antioxidants.',
    fssaiMaxPermittedNote: 'Permitted under GMP in beverages, jams, and candies.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '500',
    insCode: 'INS 500',
    canonicalName: 'Sodium Carbonates / Sodium Bicarbonate (Baking Soda)',
    aliases: ['500', 'ins500', 'ins 500', 'e500', 'e-500', '500(ii)', 'ins 500(ii)', 'ins 500ii', 'sodium bicarbonate', 'baking soda', 'sodium carbonate', 'raising agent 500(ii)'],
    functionalClass: 'acidity_regulator',
    riskCategory: 'neutral',
    neutralExplanation: 'Standard leavening and raising agent widely used in bakery goods and biscuits to release carbon dioxide during baking.',
    fssaiMaxPermittedNote: 'Permitted under GMP in bakery and snack products.',
    sourceRefs: ['FSSAI Standards 2.4.15', 'JECFA']
  },
  {
    insNumber: '503',
    insCode: 'INS 503',
    canonicalName: 'Ammonium Carbonates / Ammonium Bicarbonate',
    aliases: ['503', 'ins503', 'ins 503', 'e503', 'e-503', '503(ii)', 'ins 503(ii)', 'ins 503ii', 'ammonium bicarbonate', 'ammonium carbonate', 'raising agent 503(ii)'],
    functionalClass: 'acidity_regulator',
    riskCategory: 'neutral',
    neutralExplanation: 'Traditional leavening agent used in crackers and dry biscuits that completely dissipates as gas upon baking.',
    fssaiMaxPermittedNote: 'Permitted under GMP in bakery products.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '508',
    insCode: 'INS 508',
    canonicalName: 'Potassium Chloride',
    aliases: ['508', 'ins508', 'ins 508', 'e508', 'e-508', 'potassium chloride', 'kcl'],
    functionalClass: 'acidity_regulator',
    riskCategory: 'neutral',
    neutralExplanation: 'Mineral salt used as a gelling agent, flavor enhancer, and low-sodium salt replacer.',
    fssaiMaxPermittedNote: 'Permitted under GMP.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '551',
    insCode: 'INS 551',
    canonicalName: 'Silicon Dioxide (Amorphous Silica)',
    aliases: ['551', 'ins551', 'ins 551', 'e551', 'e-551', 'silicon dioxide', 'silica', 'anticaking agent 551', 'anti-caking agent (551)'],
    functionalClass: 'other',
    riskCategory: 'neutral',
    neutralExplanation: 'Inert mineral anticaking agent used in spice mixes, seasonings, and beverage powders to maintain free-flowing properties.',
    fssaiMaxPermittedNote: 'Permitted in spice mixes and powdered mixes up to 2% (20,000 mg/kg) under FSSAI.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '338',
    insCode: 'INS 338',
    canonicalName: 'Phosphoric Acid (Orthophosphoric Acid)',
    aliases: ['338', 'ins338', 'ins 338', 'e338', 'e-338', 'phosphoric acid', 'orthophosphoric acid', 'acidity regulator 338', 'acidity regulator (338)'],
    functionalClass: 'acidity_regulator',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Inorganic mineral acid used as an acidulant to provide tartness in cola carbonated beverages.',
    fssaiMaxPermittedNote: 'Permitted in carbonated beverages up to 600 ppm (mg/kg) under FSSAI.',
    sourceRefs: ['FSSAI Food Safety Standards Regulations Table 3', 'JECFA INS 338']
  }
];
