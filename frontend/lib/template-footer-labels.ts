import { allergenLangFromLocale, type AllergenIconLang } from './allergen-icon-labels';

export type TemplateFooterLabels = {
  address: string;
  phone: string;
};

const FOOTER_LABELS: Record<AllergenIconLang, TemplateFooterLabels> = {
  es: { address: 'Dirección', phone: 'Teléfono' },
  en: { address: 'Address', phone: 'Phone' },
  it: { address: 'Indirizzo', phone: 'Telefono' },
  de: { address: 'Adresse', phone: 'Telefon' },
  fr: { address: 'Adresse', phone: 'Téléphone' },
  ru: { address: 'Адрес', phone: 'Телефон' },
};

/** Etiquetas del footer de plantillas según locale BCP-47 de la carta. */
export function templateFooterLabelsForLocale(locale: string | null | undefined): TemplateFooterLabels {
  return FOOTER_LABELS[allergenLangFromLocale(locale)];
}
