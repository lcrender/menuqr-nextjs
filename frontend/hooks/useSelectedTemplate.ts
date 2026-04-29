/**
 * Estado persistente de “plantilla elegida desde preview” (localStorage).
 * Preferí **`template-selection-intent`** en código nuevo; este hook es una fachada estable.
 */
export {
  readTemplateIntent,
  saveTemplateIntent,
  clearTemplateIntent,
  buildIntentFromPreviewTemplateId,
  type TemplateSelectionIntent,
} from '../lib/template-selection-intent';
