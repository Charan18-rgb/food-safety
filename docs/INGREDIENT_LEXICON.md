# FoodGrade ? Ingredient & Additive Knowledge Lexicon

> Comprehensive reference guide for Indian food terminology normalization, canonical ingredient categorization, allergen classification, and INS additive metadata in @foodgrade/knowledge.

---

## 1. Architectural Role

The `@foodgrade/knowledge` package serves as the **authoritative semantic knowledge layer** for FoodGrade. It has **zero dependencies on React, browser APIs, DOM, or network I/O**, allowing it to execute identically across browser PWAs, Node.js services, and edge runtimes.

Its primary responsibilities:
1. **Normalize** raw ingredient tokens from package labels and APIs into canonical entities.
2. **Resolve** regional Indian terms and aliases (e.g. *Atta*, *Maida*, *Ragi*, *Besan*, *Vanaspati*, *Gur*, *Palmolein*).
3. **Map** International Numbering System (INS) and European (E-number) additive codes to functional classes and neutral explanations.
4. **Tag** allergen classifications (*Gluten*, *Milk*, *Peanuts*, *Soy*, *Mustard*, *Sesame*).
5. **Preserve** ingredient position index (0 = primary ingredient by weight, 1 = second, etc.).

---

## 2. Canonical Ingredient Categories

Ingredients are assigned to one of the following structured categories:

| Category | Description | Examples |
| :--- | :--- | :--- |
| `whole_grain` | Unrefined whole cereals, pseudocereals, and millets retaining bran & germ | Whole Wheat (Atta), Ragi, Bajra, Jowar, Oats, Brown Rice, Quinoa, Barley |
| `refined_cereal` | Milled or refined cereals with bran and germ stripped | Refined Wheat Flour (Maida), Semolina (Sooji), Poha, White Rice, Corn Flour |
| `pulse_legume` | High-protein pulses, split dals, legumes, and beans | Besan (Gram Flour), Chana Dal, Toor Dal, Moong Dal, Urad Dal, Masoor, Soya Chunks, Rajma |
| `cold_pressed_oil` | Traditionally extracted unrefined or cold-pressed vegetable oils | Kachi Ghani Mustard Oil, Cold-Pressed Sesame (Til) Oil, Extra Virgin Olive Oil |
| `refined_oil` | Industrially extracted and refined vegetable oils | Refined Palmolein, Palm Oil, Sunflower Oil, Soybean Oil, Rice Bran Oil, Groundnut Oil |
| `hydrogenated_fat` | Partially hydrogenated or fully hydrogenated industrial fats | Vanaspati, Dalda, Shortening |
| `unrefined_sweetener` | Traditional non-centrifugal sweeteners retaining mineral traces | Jaggery (Gur), Raw Honey, Palm Jaggery |
| `refined_sweetener` | Purified sugars, crystalline syrups, and high-GI hydrolysates | Refined Sugar (Sucrose), Liquid Glucose, Invert Sugar Syrup, Maltodextrin, Dextrose, Fructose |
| `dairy` | Whole and fractionated milk derivatives | Milk Solids, Whey Protein, Paneer, Curd (Dahi), Desi Ghee, Butter |
| `nut_seed` | Whole tree nuts, oilseeds, and aquatic seeds | Almonds (Badam), Cashews (Kaju), Peanuts, Walnuts, Fox Nuts (Makhana), Chia Seeds, Flax Seeds |
| `vegetable_fruit` | Dehydrated vegetables, purees, fruits, spices, and botanicals | Tomato Paste, Cocoa Solids, Turmeric (Haldi), Ginger (Adrak), Cumin (Jeera), Mango Pulp |
| `salt` | Edible salts | Iodized Common Salt, Rock Salt (Sendha Namak), Black Salt (Kala Namak) |
| `general` | Unclassified or unrecognized fallback items | Unmatched text tokens |

---

## 3. Alias Normalization & Matching Policy

The normalization pipeline operates in strict, deterministic order:

```text
Raw Text
   ?
   ?
Clean Text (strip percentages & noise)
   ?
   ?
Exact Canonical Match (confidence: 1.0)
   ? (if miss)
   ?
Exact Alias Match (confidence: 0.90 - 0.95)
   ? (if miss)
   ?
Sub-Phrase & Parenthetical Match (confidence: 0.88)
   ? (if miss)
   ?
Constrained Fuzzy Match (confidence: 0.70 - 0.85)
   ? (if miss)
   ?
Explicit Unknown Record (confidence: 0.0)
```

### Match Types & Confidence Ratings
1. **Exact Match (`confidence: 1.0`)**:
   - Matches canonical ID or exact normalized name (e.g. `whole_wheat_flour` -> `Whole Wheat Flour (Atta)`).
2. **Alias Match (`confidence: 0.90 ? 0.95`)**:
   - Matches registered regional aliases (e.g. `chakki fresh atta`, `maida`, `dalda`, `kachi ghani sarson tel`).
3. **Sub-Phrase Match (`confidence: 0.88`)**:
   - Matches parenthetical descriptions or embedded tokens (e.g. `Edible Vegetable Oil (Palmolein) (50%)` -> `Palmolein`).
4. **Constrained Fuzzy Match (`confidence: 0.70 ? 0.85`)**:
   - Uses Damerau-Levenshtein edit distance.
   - **Constraint**: Only applied for words >= 4 characters with similarity >= 85% and maximum edit distance <= 2. Prevents false-positive matches on short words (e.g. `oil` vs `oats`).
5. **Explicit Unknown (`confidence: 0.0`)**:
   - When no verified record matches, the item is tagged with `canonicalId: "unknown"`, `canonicalName: rawText`, and `category: "general"`.
   - **Crucial Invariant**: Unknown ingredients are **never** assumed to be positive or ultra-processed.

---

## 4. INS Additive Classification & Neutral Explanations

The additive database covers **over 30 verified INS additives** commonly found in Indian packaged foods.

### Neutral Tone Policy
Additive descriptions are strictly **educational, factual, and non-alarmist**.
- Approved Tone: *"Sodium salt of glutamic acid used as a flavour enhancer to intensify savory or umami taste."*
- Forbidden Claims: Never use unsubstantiated medical or alarmist language (*"toxic"*, *"cancer-causing"*, *"poison"*, *"dangerous"*).

### Functional Classes Supported
- `flavour_enhancer`: INS 621 (MSG), INS 627, INS 631, INS 635.
- `synthetic_colour`: INS 102 (Tartrazine), INS 110 (Sunset Yellow), INS 122 (Carmoisine), INS 124, INS 133 (Brilliant Blue), INS 150d (Caramel IV), INS 171.
- `artificial_sweetener`: INS 950 (Ace-K), INS 951 (Aspartame), INS 955 (Sucralose), INS 960 (Stevia), INS 961 (Neotame).
- `preservative`: INS 211 (Sodium Benzoate), INS 202 (Potassium Sorbate), INS 224 (KMS), INS 282 (Calcium Propionate).
- `emulsifier_stabilizer`: INS 322 (Lecithin), INS 407 (Carrageenan), INS 412 (Guar Gum), INS 415 (Xanthan Gum), INS 466 (CMC), INS 471 (Mono/Diglycerides), INS 476 (PGPR).
- `acidity_regulator` & `antioxidant`: INS 300 (Vitamin C), INS 319 (TBHQ), INS 330 (Citric Acid), INS 500 (Sodium Bicarbonate), INS 503 (Ammonium Bicarbonate), INS 551 (Silica).

---

## 5. Source Provenance & Auditing

Every record in the knowledge base includes a `sourceRefs` array citing authoritative regulatory and nutritional references:
- **FSSAI**: *Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011 (and amendments)*.
- **FSSAI**: *Food Safety and Standards (Labelling and Display) Regulations, 2020*.
- **ICMR-NIN**: *Dietary Guidelines for Indians (2024)* and *Indian Food Composition Tables (IFCT 2017)*.
- **FAO/WHO (JECFA)**: *Joint FAO/WHO Expert Committee on Food Additives*.
- **Codex Alimentarius**: *General Standard for Food Additives (CODEX STAN 192-1995)*.

---

## 6. Limitations & Expansion Roadmap

- **Current Scope**: Milestone 2 provides high-confidence coverage for 70+ canonical Indian food ingredients (300+ aliases) and 35+ core INS additives.
- **Future Additions**:
  - Expansion to 150+ regional ingredients (e.g. specialized Ayurvedic herbs like *Ashwagandha*, *Amla*, *Moringa*, *Kokum*).
  - Complete index of INS numbers up to INS 1522.
  - Multi-lingual scripts (Devanagari, Tamil, Telugu, Kannada, Bengali) for direct regional label scanning.
