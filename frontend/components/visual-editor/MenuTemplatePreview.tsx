import type { ReactNode } from 'react';
import { iconLabelsForLocale } from '../../lib/allergen-icon-labels';
import ClassicTemplate from '../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../templates/italianfood/ItalianFoodTemplate';
import GourmetTemplate from '../../templates/gourmet/GourmetTemplate';
import ProMobileTemplate from '../../templates/promobile/ProMobileTemplate';
import NightClubTemplate from '../../templates/nightclub/NightClubTemplate';
import SmartFoodTemplate from '../../templates/smartfood/SmartFoodTemplate';
import BeachBarTemplate from '../../templates/beachbar/BeachBarTemplate';
import SolNocheTemplate from '../../templates/solnoche/SolNocheTemplate';

const countryCodes: Record<string, string> = {
  Argentina: '54',
  Brasil: '55',
  Chile: '56',
  Colombia: '57',
  México: '52',
  Perú: '51',
  España: '34',
  'Estados Unidos': '1',
};

function formatPrice(price: { currency: string; amount: number }) {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  if (price.currency === 'EUR') {
    return `€ ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWhatsAppForLink(whatsapp: string, country?: string): string {
  const cleaned = whatsapp.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned.substring(1);
  if (country && countryCodes[country]) return `${countryCodes[country]}${cleaned}`;
  return cleaned;
}

type PreviewMenu = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sections: Array<{
    id: string;
    name: string;
    sort?: number;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      prices: Array<{ currency: string; label?: string; amount: number }>;
      icons: string[];
      photos: string[];
      highlighted: boolean;
    }>;
  }>;
};

type PreviewRestaurant = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  whatsapp?: string;
  country?: string;
  timezone?: string;
  primaryColor?: string;
  secondaryColor?: string;
  template?: string;
  templateConfig?: Record<string, unknown>;
};

type Props = {
  restaurant: PreviewRestaurant;
  menus: Array<{ id: string; name: string; slug: string; description?: string }>;
  selectedMenu: PreviewMenu;
  locale: string;
  onMenuSelect: (slug: string) => void;
};

/** Mismos componentes que el menú público, con la configuración todavía no publicada. */
export default function MenuTemplatePreview({
  restaurant,
  menus,
  selectedMenu,
  locale,
  onMenuSelect,
}: Props) {
  const template = String(restaurant.template || 'classic');
  const menuList = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    ...(menu.description ? { description: menu.description } : {}),
  }));
  const templateProps = {
    restaurant,
    menuList,
    selectedMenu,
    onMenuSelect,
    formatPrice,
    formatWhatsAppForLink,
    iconLabels: iconLabelsForLocale(locale),
  };

  let body: ReactNode;
  if (template === 'classic') body = <ClassicTemplate key={template} {...templateProps} />;
  else if (template === 'minimalist') body = <MinimalistTemplate key={template} {...templateProps} />;
  else if (template === 'foodie') body = <FoodieTemplate key={template} {...templateProps} />;
  else if (template === 'burgers') body = <BurgersTemplate key={template} {...templateProps} />;
  else if (template === 'gourmet') body = <GourmetTemplate key={template} {...templateProps} />;
  else if (template === 'proMobile') body = <ProMobileTemplate key={template} {...templateProps} />;
  else if (template === 'nightClub') body = <NightClubTemplate key={template} {...templateProps} />;
  else if (template === 'smartFood') body = <SmartFoodTemplate key={template} {...templateProps} />;
  else if (template === 'beachBar') body = <BeachBarTemplate key={template} {...templateProps} />;
  else if (template === 'solNoche') body = <SolNocheTemplate key={template} {...templateProps} />;
  else if (template === 'italianFood') body = <ItalianFoodTemplate key={template} {...templateProps} />;
  else body = <ClassicTemplate key={template} {...templateProps} />;

  return body;
}
