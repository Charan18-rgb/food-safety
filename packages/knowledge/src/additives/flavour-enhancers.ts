import { AdditiveKnowledge } from '../types.js';

export const FLAVOUR_ENHANCERS: AdditiveKnowledge[] = [
  {
    insNumber: '621',
    insCode: 'INS 621',
    canonicalName: 'Monosodium Glutamate (MSG)',
    aliases: ['621', 'ins621', 'ins 621', 'e621', 'e-621', 'msg', 'monosodium glutamate', 'monosodium l-glutamate', 'sodium glutamate'],
    functionalClass: 'flavour_enhancer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Sodium salt of glutamic acid used as a flavour enhancer to intensify savory or umami taste.',
    fssaiMaxPermittedNote: 'Permitted in specified foods under GMP per FSSAI regulations.',
    sourceRefs: ['FSSAI Food Additives Appendix A', 'JECFA Monograph', 'Codex STAN 192-1995']
  },
  {
    insNumber: '627',
    insCode: 'INS 627',
    canonicalName: "Disodium 5'-Guanylate",
    aliases: ['627', 'ins627', 'ins 627', 'e627', 'e-627', 'disodium guanylate', 'sodium guanylate', 'disodium 5-guanylate'],
    functionalClass: 'flavour_enhancer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Nucleotide flavour enhancer often used synergistically with MSG to impart savory taste in seasonings and instant noodles.',
    fssaiMaxPermittedNote: 'Permitted in seasonings, snacks, and soups under GMP.',
    sourceRefs: ['FSSAI Regulations Table 1', 'JECFA']
  },
  {
    insNumber: '631',
    insCode: 'INS 631',
    canonicalName: "Disodium 5'-Inosinate",
    aliases: ['631', 'ins631', 'ins 631', 'e631', 'e-631', 'disodium inosinate', 'sodium inosinate', 'disodium 5-inosinate'],
    functionalClass: 'flavour_enhancer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Nucleotide flavour enhancer derived from meat or fermented tapioca; used synergistically with glutamates.',
    fssaiMaxPermittedNote: 'Permitted in savory snacks and processed foods under GMP.',
    sourceRefs: ['FSSAI Regulations Table 1', 'JECFA']
  },
  {
    insNumber: '635',
    insCode: 'INS 635',
    canonicalName: "Disodium 5'-Ribonucleotides",
    aliases: ['635', 'ins635', 'ins 635', 'e635', 'e-635', 'disodium 5-ribonucleotides', 'sodium 5-ribonucleotide', 'disodium ribonucleotide'],
    functionalClass: 'flavour_enhancer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Synergistic blend of disodium inosinate and disodium guanylate used in savory snacks and instant noodle tastemakers.',
    fssaiMaxPermittedNote: 'Permitted under GMP in flavored snacks and noodles.',
    sourceRefs: ['FSSAI Regulations Table 1']
  }
];
