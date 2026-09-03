/*
# Add company_key and concept_key columns to dev_configs

1. Modified Tables
   - `dev_configs`
     - Added `company_key` (text, default '') — company identifier for edge function lookups
     - Added `concept_key` (text, default '') — concept identifier for edge function lookups

2. Important Notes
   - These fields map to the company and concept parameters used by
     the existing WAND integration edge functions.
   - Idempotent: uses DO block with IF NOT EXISTS checks.
*/

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dev_configs' AND column_name = 'company_key'
    ) THEN
        ALTER TABLE dev_configs ADD COLUMN company_key text DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dev_configs' AND column_name = 'concept_key'
    ) THEN
        ALTER TABLE dev_configs ADD COLUMN concept_key text DEFAULT '';
    END IF;
END $$;