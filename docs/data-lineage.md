# FoodGrade Data Lineage

All data flows strictly through the Multi-Source Ingestion Pipeline (`build_multi_source_catalog.ts`), enforcing field-level provenance tracking.

## PRECEDENCE RULES

If conflicts occur during ingestion:
1. **Product Identity**: Verified brand owner -> USDA -> Indian Dataset -> OFF -> Identity DBs
2. **Ingredients**: Indian Dataset -> USDA -> OFF
3. **Nutrition**: USDA -> Indian Dataset -> OFF

## CURRENT CATALOG SNAPSHOT (25,182 Records)

The current pipeline iteration relies on the globally validated subset from **Open Food Facts** to seed the catalog's base 25,182 records, guaranteeing true ODbL compliance while ensuring 100% of the ingested rows are authentic products verified against a stringent food-only classification filter and exact Mod-10 checksum validation.

## EXPORT FORMATS

* JSONL for fast ingestion and API streaming
* CSV for analytics, ML experimentation, and pandas processing
