ALTER TABLE formulaire_type
  ADD COLUMN IF NOT EXISTS schema_json JSONB,
  ADD COLUMN IF NOT EXISTS schema_source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS schema_version VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_formulaire_type_schema_json
  ON formulaire_type USING GIN (schema_json);
