# Module generation de formulaires

## Objectif

Le module ajoute un schema JSON pivot stocke dans `formulaire_type.schema_json`.
Ce schema garde la mise en forme riche du formulaire tout en continuant a alimenter
les tables existantes `champ_definition` et `valeur_saisie`.

## Migration base de donnees

Sur une base existante, executer :

```sql
\i migrations/2026-05-21_form_schema_jsonb.sql
```

Ou directement :

```sql
ALTER TABLE formulaire_type
  ADD COLUMN IF NOT EXISTS schema_json JSONB,
  ADD COLUMN IF NOT EXISTS schema_source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS schema_version VARCHAR(20);
```

## Schema JSON pivot

Structure principale :

```json
{
  "version": "1.0",
  "title": "Controle quotidien",
  "layout": { "columns": 3, "rowGap": 16, "columnGap": 16 },
  "sections": [
    {
      "id": "uuid",
      "title": "Identification",
      "color": "#2D6A4F",
      "position": { "rowStart": 1, "rowEnd": 3, "colStart": 1, "colEnd": 3 },
      "style": { "labelColor": "#ffffff", "bold": true }
    }
  ],
  "fields": [
    {
      "id": "uuid",
      "legacyChampId": "uuid champ_definition",
      "name": "date_controle",
      "label": "Date controle",
      "type": "date",
      "required": true,
      "options": [],
      "validation": {},
      "position": { "row": 2, "column": 1, "colSpan": 1 },
      "style": { "labelColor": "#374151", "bold": false, "backgroundColor": null }
    }
  ],
  "source": { "type": "embedded_spreadsheet" },
  "audit": { "generatedAt": "ISO_DATE", "generator": "innofaso-schema-pivot" }
}
```

Types supportes : `text`, `number`, `date`, `select`, `checkbox`, `textarea`,
`currency`, `email`, `phone`, `file`, `time`, `signature`.

## Page du generateur Excel

Le generateur est volontairement separe de la page formulaire existante.

Route :

```text
/generateur-excel
```

Dans le menu admin, ouvrir **Generateur Excel**.

La page `Formulaires > Configurer` n'est plus modifiee par le generateur.

## Point d'entree 1 : Excel integre

Flux :

1. L'utilisateur cree ou importe un tableau dans Luckysheet, un tableur type Excel.
2. Les cellules fusionnees deviennent des sections.
3. Les styles lisibles du tableur sont repris : couleur de fond, couleur de texte, gras.
4. SheetJS est charge cote navigateur pour lire les fichiers `.xlsx` avec `cellStyles`, `cellDates` et `cellNF`.
5. Le bouton `Generer le formulaire` appelle :

```http
POST /api/formulaires/:id/generer-depuis-tableur
```

Le backend convertit le tableur en schema pivot, stocke `schema_json`, desactive
les anciens champs, puis recree les `champ_definition` compatibles avec les
soumissions actuelles.

## Rendu du formulaire

La page `Remplir` detecte `schema_json`.
Si le schema existe, elle rend les sections en `fieldset`, respecte le nombre de
colonnes et reutilise les champs EAV generes pour envoyer les soumissions comme avant.

## Point d'entree 2 : import externe

Endpoint prepare :

```http
POST /api/formulaires/:id/importer-schema
```

Il accepte soit un `schema` pivot complet, soit un objet `sheet` deja extrait.
Le parsing frontend SheetJS/pdf.js/Gemini peut se brancher dessus sans changer
la persistence.

## Point d'entree 3 : prompts IA

Endpoint :

```http
POST /api/formulaires/:id/prompt-ia
Body: { "prompt": "ajoute un champ date a gauche du champ nom" }
```

Pre-requis dans `backend/.env` :

```env
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
```

Le backend envoie toujours le schema actuel a Groq et force un retour JSON pur
avec `response_format: { "type": "json_object" }`. Le modele doit retourner un
delta, pas le schema entier. Le backend applique ensuite les operations et
resynchronise les `champ_definition`.

## Fichiers principaux

- `backend/src/services/formSchema.service.js` : schema pivot, conversions tableur et EAV.
- `backend/src/services/formAi.service.js` : prompt Groq et application des deltas.
- `backend/src/controllers/formulaire.controller.js` : endpoints schema/tableur/import/IA.
- `frontend/src/pages/ExcelFormGeneratorPage.jsx` : page separee avec Luckysheet et import Excel.
- `frontend/src/components/form-builder/AiFormPrompt.jsx` : prompt IA.
- `frontend/src/pages/FormulaireRemplirPage.jsx` : rendu depuis le schema pivot.
