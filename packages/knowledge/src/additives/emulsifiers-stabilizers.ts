import { AdditiveKnowledge } from '../types.js';

export const EMULSIFIERS_STABILIZERS: AdditiveKnowledge[] = [
  {
    insNumber: '322',
    insCode: 'INS 322',
    canonicalName: 'Lecithins (Soy / Sunflower Lecithin)',
    aliases: ['322', 'ins322', 'ins 322', 'e322', 'e-322', 'lecithin', 'soya lecithin', 'soy lecithin', 'sunflower lecithin'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'neutral',
    neutralExplanation: 'Naturally derived plant phospholipid used to stabilize oil-and-water emulsions and control viscosity in chocolate.',
    fssaiMaxPermittedNote: 'Permitted under GMP in confectionery, bakery, and dairy.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '407',
    insCode: 'INS 407',
    canonicalName: 'Carrageenan',
    aliases: ['407', 'ins407', 'ins 407', 'e407', 'e-407', 'carrageenan', 'irish moss extract'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Hydrocolloid polysaccharide extracted from red edible seaweeds, used for gelling, thickening, and stabilizing dairy and plant milks.',
    fssaiMaxPermittedNote: 'Permitted under GMP in specified foods.',
    sourceRefs: ['FSSAI Standards', 'JECFA 2015']
  },
  {
    insNumber: '412',
    insCode: 'INS 412',
    canonicalName: 'Guar Gum',
    aliases: ['412', 'ins412', 'ins 412', 'e412', 'e-412', 'guar gum', 'cyamopsis tetragonoloba gum'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'neutral',
    neutralExplanation: 'Natural dietary galactomannan fiber gum extracted from Indian cluster beans (guar), widely used as a thickener and stabilizer.',
    fssaiMaxPermittedNote: 'Permitted under GMP.',
    sourceRefs: ['FSSAI Standards', 'ICMR-NIN']
  },
  {
    insNumber: '415',
    insCode: 'INS 415',
    canonicalName: 'Xanthan Gum',
    aliases: ['415', 'ins415', 'ins 415', 'e415', 'e-415', 'xanthan gum', 'xanthan'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'neutral',
    neutralExplanation: 'Polysaccharide produced by fermentation of glucose by Xanthomonas campestris, used as an effective rheology modifier.',
    fssaiMaxPermittedNote: 'Permitted under GMP.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '466',
    insCode: 'INS 466',
    canonicalName: 'Sodium Carboxymethyl Cellulose (CMC)',
    aliases: ['466', 'ins466', 'ins 466', 'e466', 'e-466', 'cmc', 'cellulose gum', 'sodium carboxymethyl cellulose'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Modified cellulose polymer used as an industrial stabilizer, thickener, and moisture retainer in ice creams and sauces.',
    fssaiMaxPermittedNote: 'Permitted under GMP.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '471',
    insCode: 'INS 471',
    canonicalName: 'Mono- and Di-Glycerides of Fatty Acids',
    aliases: ['471', 'ins471', 'ins 471', 'e471', 'e-471', 'mono and diglycerides of fatty acids', 'monoglycerides', 'diglycerides', 'glyceryl monostearate', 'gms'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Industrial emulsifiers synthesized from vegetable or animal fats; used to improve crumb structure and extend shelf-life in bakery and biscuits.',
    fssaiMaxPermittedNote: 'Permitted under GMP.',
    sourceRefs: ['FSSAI Standards', 'JECFA']
  },
  {
    insNumber: '476',
    insCode: 'INS 476',
    canonicalName: 'Polyglycerol Polyricinoleate (PGPR)',
    aliases: ['476', 'ins476', 'ins 476', 'e476', 'e-476', 'pgpr', 'polyglycerol polyricinoleate'],
    functionalClass: 'emulsifier_stabilizer',
    riskCategory: 'processing_indicator',
    neutralExplanation: 'Synthetic emulsifier produced from glycerol and castor oil fatty acids, used in chocolate to reduce viscosity and replace cocoa butter.',
    fssaiMaxPermittedNote: 'Permitted in chocolate up to 0.5% (5000 mg/kg) under FSSAI.',
    sourceRefs: ['FSSAI Standards 2.7.4', 'EFSA']
  }
];
