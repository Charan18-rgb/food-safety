# FoodGrade Scoring Algorithm v1.0 ? Specification & Mathematical Model

> [!WARNING]
> **PROPOSED PRODUCT ALGORITHM ? NOT YET VALIDATED**
>
> The scoring formulas, pillar weights, penalty deductions, bonus additions, and A?E grade boundaries described in this document are **product-design decisions created by FoodGrade**.
>
> They are **NOT** official FSSAI regulations, nor do they represent a government-mandated front-of-pack grading system. FSSAI provides statutory labelling standards and Recommended Dietary Allowances (RDA), which FoodGrade uses as reference inputs, but the composite 0?100 score and A?E grade are proprietary algorithmic evaluations.
>
> This system is designed for nutritional transparency and ingredient awareness. It is **NOT** a medical diagnostic tool and does not declare foods medically "safe" or "dangerous."

---

## 1. Distinction of Concepts

To maintain scientific integrity and regulatory compliance, FoodGrade strictly separates:

1. **Regulatory Reference Facts**:
   - FSSAI requirement for ingredients to be declared in descending order of incoming weight.
   - FSSAI statutory declarations for artificial sweeteners and synthetic colours.
   - FSSAI dietary reference value: 2000 kcal diet basis for Indian adults.
2. **Nutritional Reference Values**:
   - Reference daily intakes: Added sugars (<50g/day), Saturated fat (<22g/day), Sodium (<2000mg/day or ~5g salt), Dietary fiber (30g/day), Protein (54g/day).
3. **FoodGrade Algorithm Decisions (Algorithm v1.0)**:
   - Three-pillar composite structure (45% Nutrition, 35% Ingredients, 20% Additives).
   - Mathematical penalties for high sugar, saturated fat, sodium, refined flour (Maida), and industrial palm oil.
   - Mathematical bonuses for dietary fiber, protein, whole grains (Atta, Millets), and pulses.
   - Score-to-Grade threshold brackets (A >= 80, B >= 65, C >= 50, D >= 35, E < 35).

---

## 2. Mathematical Model & Pillar Weights

Given a structured `ProductInput`, the composite score S in [0, 100] is computed as:

```text
compositeRaw = S_nutri * w_nutri + S_ing * w_ing + S_add * w_add
Score = round(clamp(compositeRaw, 0, 100))
```

### Default Weights (Configurable in v1.0)
- `w_nutri = 0.45` (45% Nutritional Balance Pillar)
- `w_ing = 0.35` (35% Ingredient Quality & Refinement Pillar)
- `w_add = 0.20` (20% Additive Load & Processing Level Pillar)

---

## 3. Pillar 1: Nutritional Balance (S_nutri)

- **Starting Baseline**: 70 points.
- **Configurable Liquid Beverage Scaling**: When nutrition is declared `per_100ml`, nutrient thresholds are scaled by `config.nutrition.liquidBeverageMultiplier` (default: `0.50`). This FoodGrade product-design decision reflects larger volumetric consumption per serving for liquids without affecting non-nutritional pillars.

### 3.1 Added Sugar vs Total Sugar Semantics
To prevent natural sugars (e.g. lactose in milk, intrinsic fructose in fruit) from being misclassified as added sweeteners:
- **When Added Sugar is Declared (`addedSugarsG !== null`)**:
  - `effectiveSugar = addedSugarsG` is evaluated against thresholds.
  - `effectiveSugar <= 5g * multiplier`: `penalty = 0` (if <= 2g, positive highlight added)
  - `5g * mult < effectiveSugar <= 12g * mult`: `penalty = ((effectiveSugar - 5*mult) / (7*mult)) * 12`
  - `12g * mult < effectiveSugar <= 25g * mult`: `penalty = 12 + ((effectiveSugar - 12*mult) / (13*mult)) * 13`
  - `effectiveSugar > 25g * mult`: `penalty = min(25 + ((effectiveSugar - 25*mult) / (15*mult)) * 15, 40)`
- **When Added Sugar is Missing but Total Sugar is Present**:
  - Do **NOT** apply an added-sugar penalty from total sugar alone.
  - Record an informational factor (`added_sugar_unavailable`).
  - Record `addedSugarsG` in `missingMandatoryFields` to appropriately lower data confidence.
- **When Both Are Missing**:
  - No sugar scoring factor evaluated; record in missing fields.

### 3.2 Saturated Fat
- If `saturatedFatG > 5g * multiplier`: `penalty = min((saturatedFatG - 5*multiplier) * 1.0, 20)` (up to max 20 pts)

### 3.3 Trans Fat
- If `transFatG > 0.1g`: `penalty = 15 pts` (severe penalty reflecting FSSAI 2% industrial trans fat cap)

### 3.4 Sodium / Salt
- If `sodiumMg <= 400mg * multiplier` (~1g salt): `penalty = 0`
- If `400mg * mult < sodiumMg <= 800mg * mult`: `penalty = ((sodiumMg - 400*mult) / (400*mult)) * 8` (0 to 8 pts)
- If `sodiumMg > 800mg * mult`: `penalty = min(8 + ((sodiumMg - 800*mult) / (400*mult)) * 12, 30)` (up to max 30 pts)

### 3.5 Dietary Fiber & Protein Bonuses
- **Fiber**:
  - `dietaryFiberG >= 6g` (High Fiber): `+12 pts`
  - `3g <= dietaryFiberG < 6g` (Source of Fiber): `+5 pts`
- **Protein**:
  - `proteinG >= 10g` (High Protein): `+10 pts`
  - `5g <= proteinG < 10g` (Source of Protein): `+5 pts`

### 3.6 Caloric Density Rule (Strict Missing Data Invariant)
- Evaluated **only** if energy is high (`energyKcal > 450 kcal`) AND **both** fiber and protein are known/declared.
- If `fiber < 2g` AND `protein < 3g`: `penalty = 5 pts`
- If either fiber or protein is missing/unavailable (`null`), the penalty is **NOT** applied, adhering strictly to the invariant that missing data is never treated as zero.

---

## 4. Pillar 2: Ingredient Quality & Refinement (S_ing)

- **Starting Baseline**: 80 points.
- **Position Decay Power**: `p(i) = 1 / sqrt(i + 1)`, where `i = positionIndex` (0 = primary ingredient by weight).

### 4.1 Refinement & Processing Penalties
- **Refined Wheat Flour (Maida)**: `penalty = 20 * p(i)`
- **Palm Oil / Palmolein**: `penalty = 15 * p(i)`
- **Hydrogenated Vegetable Oil (Vanaspati)**: `penalty = 25 * p(i)`
- **Industrial Sweetener Syrups (Liquid Glucose, Invert Sugar, Maltodextrin)**: `penalty = min(12 * p(i), remainingSyrupCap)` (capped at max 25 pts total)

### 4.2 Wholesome Ingredient Bonuses
- **Whole Grains (Atta, Oats, Brown Rice)**: `bonus = 15 * p(i)`
- **Indian Millets (Ragi, Bajra, Jowar, Foxtail, Kodo, Barnyard, Little)**: `bonus = 15 * p(i)`
- **Pulses, Legumes, Nuts & Seeds**: `bonus = 10 * p(i)`
- **Cold-Pressed Oils (Mustard, Sesame, Olive)**: `bonus = 8 * p(i)`

---

## 5. Pillar 3: Additive Load & Processing Level (S_add)

- **Starting Baseline**: 100 points.
- **Deduplication**: Duplicate mentions of the same INS code on a single package are deducted once.
- **Penalties**:
  - **Artificial Sweeteners** (INS 950, 951, 955, 961): `-12 pts`
  - **Synthetic Colours** (INS 102, 110, 122, 124, 133, 171): `-10 pts`
  - **Flavour Enhancers** (INS 621 MSG, 627, 631, 635): `-6 pts`
  - **Chemical Preservatives** (INS 211, 202, 224, 282): `-5 pts`
  - **Industrial Emulsifiers / Thickeners** (INS 407, 466, 471, 476): `-4 pts`
  - **Neutral Additives** (INS 300 Vitamin C, 322 Lecithin, 330 Citric Acid, 500 Sodium Bicarbonate): `0 pts`

---

## 6. Anti-Double-Counting Policy

1. **Sugar vs Syrups**:
   - Refined table sugar in ingredients carries `0` ingredient deduction because its mass is directly measured and penalized under the Nutritional Balance pillar.
   - Industrial syrups (liquid glucose, invert syrup, maltodextrin) carry an ingredient deduction because they represent an industrial ultra-processing formulation marker independent of caloric sugar mass.
2. **Fat vs Saturated Fat**:
   - Palmolein carries an ingredient deduction due to high palmitic acid refinement profile, while nutritional saturated fat penalizes measured grams.

---

## 7. Missing Data & Confidence Assessment

- **Missing Data Rule**: Missing nutrient values are **never** treated as zero. If a field is missing, no penalty or bonus is applied, and the field is recorded in `missingMandatoryFields`.
- **Confidence Formula**:
  ```text
  nutritionScore = presentNutrientsCount / 9
  ingredientScore = 0.4 + 0.6 * (recognizedIngredients / totalIngredients)
  provenanceScore = input.provenance.rawConfidence
  numericConfidence = 0.50 * nutritionScore + 0.35 * ingredientScore + 0.15 * provenanceScore
  ```
- **Thresholds**:
  - `high`: `>= 0.85`
  - `moderate`: `0.60 - 0.84`
  - `low`: `< 0.60`

---

## 8. Grade Mapping

| Grade | Score Range | Profile |
| :---: | :---: | :--- |
| **A** | 80 ? 100 | Nutrient-dense, wholesome whole food ingredients, minimal refinement |
| **B** | 65 ? 79 | Good overall nutritional balance, minor added sugar or refinement |
| **C** | 50 ? 64 | Moderate nutritional quality with noticeable added sugar, fat, sodium, or refinement |
| **D** | 35 ? 49 | High in added sugar, saturated fat, refined flours (Maida), or additive load |
| **E** | 0 ? 34 | Ultra-processed, excessive added sugars, industrial trans-fats, or synthetic additives |
