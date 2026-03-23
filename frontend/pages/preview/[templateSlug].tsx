import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { getPreviewData, getPreviewTemplateIds } from '../../data/preview-data';
import ClassicTemplate from '../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../templates/italianfood/ItalianFoodTemplate';
import GourmetTemplate from '../../templates/gourmet/GourmetTemplate';
import type { ItemPrice } from '../../data/preview-data';

const formatPrice = (price: ItemPrice) => {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  if (price.currency === 'EUR') {
    return `€ ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const countryCodes: { [key: string]: string } = {
  'Argentina': '54',
  'España': '34',
  'Italia': '39',
};

const formatWhatsAppForLink = (whatsapp: string, country?: string): string => {
  let cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned.substring(1);
  if (country && countryCodes[country]) return `${countryCodes[country]}${cleaned}`;
  return cleaned;
};

const iconLabels: { [key: string]: string } = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

export default function PreviewPage() {
  const router = useRouter();
  const { templateSlug } = router.query;
  const slug = typeof templateSlug === 'string' ? templateSlug : '';

  const data = slug ? getPreviewData(slug) : null;
  const validIds = getPreviewTemplateIds();

  if (!slug || !data) {
    return (
      <div className="container mt-5 py-5">
        <div className="alert alert-warning" role="alert">
          {slug && !data
            ? `Plantilla "${slug}" no encontrada. Usa: ${validIds.join(', ')}`
            : 'Especifica una plantilla en la URL: /preview/classic, /preview/minimalist, etc.'}
        </div>
        <p className="mt-3">
          <Link href="/admin/templates" className="btn btn-primary">
            Ir a Plantillas
          </Link>
        </p>
      </div>
    );
  }

  const { restaurant, menu, menus } = data;
  const menuListSource = menus?.length ? menus : [menu];
  const [selectedSlug, setSelectedSlug] = useState<string>(() => menuListSource[0]?.slug ?? '');
  useEffect(() => {
    const s = menuListSource[0]?.slug;
    if (s) setSelectedSlug(s);
  }, [slug]);
  const selectedMenuFromList = useMemo(
    () => menuListSource.find((m) => m.slug === selectedSlug) ?? menuListSource[0],
    [menuListSource, selectedSlug]
  );

  if (!menuListSource[0] || !selectedMenuFromList) {
    return (
      <div className="container mt-5 py-5">
        <div className="alert alert-warning" role="alert">Sin menú en la vista previa.</div>
        <Link href="/admin/templates" className="btn btn-primary mt-2">Ir a plantillas</Link>
      </div>
    );
  }

  const selectedMenu = {
    id: selectedMenuFromList.id,
    name: selectedMenuFromList.name,
    slug: selectedMenuFromList.slug,
    ...(selectedMenuFromList.description && { description: selectedMenuFromList.description }),
    sections: selectedMenuFromList.sections,
  };
  const menuList = menuListSource.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    ...(m.description && { description: m.description }),
  }));
  const onMenuSelect = (menuSlug: string) => setSelectedSlug(menuSlug);

  const commonProps = {
    restaurant,
    menuList,
    selectedMenu,
    onMenuSelect,
    formatPrice,
    formatWhatsAppForLink,
    iconLabels,
  };

  const template = (restaurant.template || menu.template || 'classic') as string;

  if (template === 'classic') return <ClassicTemplate {...commonProps} />;
  if (template === 'minimalist') return <MinimalistTemplate {...commonProps} />;
  if (template === 'foodie') return <FoodieTemplate {...commonProps} />;
  if (template === 'burgers') return <BurgersTemplate {...commonProps} />;
  if (template === 'gourmet') return <GourmetTemplate {...commonProps} />;
  if (template === 'italianFood') return <ItalianFoodTemplate {...commonProps} />;

  return <ClassicTemplate {...commonProps} />;
}
