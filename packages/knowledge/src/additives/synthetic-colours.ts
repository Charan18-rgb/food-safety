import { AdditiveKnowledge } from '../types.js';

export const SYNTHETIC_COLOURS: AdditiveKnowledge[] = [
  {
    insNumber: '102',
    insCode: 'INS 102',
    canonicalName: 'Tartrazine (Synthetic Yellow 4)',
    aliases: ['102', 'ins102', 'ins 102', 'e102', 'e-102', 'tartrazine', 'fd&c yellow no. 5', 'ci food yellow 4'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Synthetic lemon-yellow azo dye used in confectionery, beverages, and snack seasonings.',
    fssaiMaxPermittedNote: 'Permitted up to 100 mg/kg in specified food categories; statutory label declaration mandatory under FSSAI.',
    sourceRefs: ['FSSAI Food Safety Standards Regulations 2.11', 'Codex Alimentarius']
  },
  {
    insNumber: '110',
    insCode: 'INS 110',
    canonicalName: 'Sunset Yellow FCF',
    aliases: ['110', 'ins110', 'ins 110', 'e110', 'e-110', 'sunset yellow', 'sunset yellow fcf', 'fd&c yellow no. 6', 'orange yellow s'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Synthetic orange azo dye used to colour beverages, confectionery, desserts, and savory snacks.',
    fssaiMaxPermittedNote: 'Permitted up to 100 mg/kg in specified foods under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.11', 'JECFA']
  },
  {
    insNumber: '122',
    insCode: 'INS 122',
    canonicalName: 'Carmoisine / Azorubine',
    aliases: ['122', 'ins122', 'ins 122', 'e122', 'e-122', 'carmoisine', 'azorubine', 'food red 3'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Synthetic red azo dye providing strawberry and raspberry-like coloration to jams, confectionery, and drinks.',
    fssaiMaxPermittedNote: 'Permitted up to 100 mg/kg in specified foods under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.11', 'EFSA Food Additives Panel']
  },
  {
    insNumber: '124',
    insCode: 'INS 124',
    canonicalName: 'Ponceau 4R (Cochineal Red A)',
    aliases: ['124', 'ins124', 'ins 124', 'e124', 'e-124', 'ponceau 4r', 'cochineal red a', 'food red 7'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Synthetic strawberry-red azo dye used in confectionery, fruit syrups, and bakery products.',
    fssaiMaxPermittedNote: 'Permitted up to 100 mg/kg in specified foods under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.11']
  },
  {
    insNumber: '133',
    insCode: 'INS 133',
    canonicalName: 'Brilliant Blue FCF',
    aliases: ['133', 'ins133', 'ins 133', 'e133', 'e-133', 'brilliant blue', 'brilliant blue fcf', 'fd&c blue no. 1'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Synthetic triarylmethane blue dye used in ice creams, confectionery, and energy beverages.',
    fssaiMaxPermittedNote: 'Permitted up to 100 mg/kg in specified foods under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.11', 'JECFA']
  },
  {
    insNumber: '150d',
    insCode: 'INS 150d',
    canonicalName: 'Sulphite Ammonia Caramel (Caramel IV)',
    aliases: ['150d', 'ins150d', 'ins 150d', 'e150d', 'e-150d', 'caramel iv', 'sulphite ammonia caramel', 'caramel color iv'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Water-soluble dark brown food colouring prepared by controlled heat treatment of carbohydrates with ammonium and sulphite compounds; used in colas and sauces.',
    fssaiMaxPermittedNote: 'Permitted in carbonated beverages and sauces under specified limits.',
    sourceRefs: ['FSSAI Food Additives Table', 'JECFA 2011']
  },
  {
    insNumber: '160a',
    insCode: 'INS 160a',
    canonicalName: 'Beta-Carotenes',
    aliases: ['160a', 'ins160a', 'ins 160a', 'e160a', 'e-160a', 'beta carotene', 'beta-carotene', 'carotenes', 'provitamin a'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'neutral',
    neutralExplanation: 'Plant-derived or synthesized orange pigment; acts as a precursor to Vitamin A.',
    fssaiMaxPermittedNote: 'Permitted under GMP in dairy, spreads, and beverages.',
    sourceRefs: ['FSSAI Standards']
  },
  {
    insNumber: '171',
    insCode: 'INS 171',
    canonicalName: 'Titanium Dioxide',
    aliases: ['171', 'ins171', 'ins 171', 'e171', 'e-171', 'titanium dioxide', 'ci 77891'],
    functionalClass: 'synthetic_colour',
    riskCategory: 'caution_load',
    neutralExplanation: 'Inorganic white pigment used to impart opacity in confectionery, chewing gums, and frostings.',
    fssaiMaxPermittedNote: 'Historically permitted under FSSAI; subject to evolving regulatory scrutiny globally.',
    sourceRefs: ['FSSAI Standards', 'EFSA Scientific Opinion on E171']
  }
];
