import { PLANTILLA_BEACH_BAR_LANDING } from '../data/plantilla-landing-beach-bar';
import { PLANTILLA_BURGERS_LANDING } from '../data/plantilla-landing-burgers';
import { PLANTILLA_CLASSIC_LANDING } from '../data/plantilla-landing-classic';
import { PLANTILLA_FOODIE_LANDING } from '../data/plantilla-landing-foodie';
import { PLANTILLA_GOURMET_LANDING } from '../data/plantilla-landing-gourmet';
import { PLANTILLA_ITALIAN_FOOD_LANDING } from '../data/plantilla-landing-italian-food';
import { PLANTILLA_MINIMALISTA_LANDING } from '../data/plantilla-landing-minimalista';
import { PLANTILLA_MODERN_FOOD_LANDING } from '../data/plantilla-landing-modern-food';
import { PLANTILLA_NIGHT_CLUB_LANDING } from '../data/plantilla-landing-night-club';
import { PLANTILLA_SMART_FOOD_LANDING } from '../data/plantilla-landing-smart-food';
import { PLANTILLA_SOL_NOCHE_LANDING } from '../data/plantilla-landing-sol-noche';
import { apiTemplateIdToCatalogSlug } from './template-selection-intent';

const PLANTILLA_HERO_MOCKUP_BY_SLUG: Record<string, string> = {
  classic: PLANTILLA_CLASSIC_LANDING.heroPreviewImage!,
  minimalista: PLANTILLA_MINIMALISTA_LANDING.heroPreviewImage!,
  foodie: PLANTILLA_FOODIE_LANDING.heroPreviewImage!,
  gourmet: PLANTILLA_GOURMET_LANDING.heroPreviewImage!,
  'modern-food': PLANTILLA_MODERN_FOOD_LANDING.heroPreviewImage!,
  'night-club': PLANTILLA_NIGHT_CLUB_LANDING.heroPreviewImage!,
  burgers: PLANTILLA_BURGERS_LANDING.heroPreviewImage!,
  'italian-food': PLANTILLA_ITALIAN_FOOD_LANDING.heroPreviewImage!,
  'smart-food': PLANTILLA_SMART_FOOD_LANDING.heroPreviewImage!,
  'beach-bar': PLANTILLA_BEACH_BAR_LANDING.heroPreviewImage!,
  'sol-noche': PLANTILLA_SOL_NOCHE_LANDING.heroPreviewImage!,
};

export function getPlantillaHeroMockupImage(slug: string): string | undefined {
  return PLANTILLA_HERO_MOCKUP_BY_SLUG[slug];
}

export function getPlantillaHeroMockupByApiTemplateId(apiTemplateId: string): string | undefined {
  return getPlantillaHeroMockupImage(apiTemplateIdToCatalogSlug(apiTemplateId));
}
