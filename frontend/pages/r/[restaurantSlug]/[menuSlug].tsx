import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ClassicTemplate from '../../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../../templates/italianfood/ItalianFoodTemplate';

interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  prices: ItemPrice[];
  icons: string[];
  photos?: string[];
}

interface ItemPrice {
  currency: string;
  label?: string;
  amount: number;
}

const formatPrice = (price: ItemPrice) => {
  if (price.currency === 'ARS') {
    // Para ARS, mostrar sin centavos con símbolo $
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  // Para otras monedas, mostrar con 2 decimales
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Códigos de país comunes para WhatsApp
const countryCodes: { [key: string]: string } = {
  'Argentina': '54',
  'Brasil': '55',
  'Chile': '56',
  'Colombia': '57',
  'México': '52',
  'Perú': '51',
  'España': '34',
  'Estados Unidos': '1',
};

const formatWhatsAppForLink = (whatsapp: string, country?: string): string => {
  // Limpiar el número (remover espacios, guiones, paréntesis, etc.)
  let cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');
  
  // Si el número ya tiene código de país (empieza con +), devolverlo limpio
  if (cleaned.startsWith('+')) {
    return cleaned.substring(1);
  }
  
  // Si hay un código de país, agregarlo
  if (country && countryCodes[country]) {
    return `${countryCodes[country]}${cleaned}`;
  }
  
  // Si no se puede determinar el código de país, devolver el número limpio
  return cleaned;
};

interface Restaurant {
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
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface Menu {
  id: string;
  slug: string;
  name: string;
  description?: string;
  template?: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  sections: MenuSection[];
}

const iconLabels: { [key: string]: string } = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

export default function MenuPage() {
  const router = useRouter();
  const { restaurantSlug, menuSlug } = router.query;
  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!restaurantSlug || !menuSlug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener el menú
        const menuResponse = await axios.get(
          `http://localhost:3001/public/restaurants/${restaurantSlug}/menus/${menuSlug}`,
        );
        setMenu(menuResponse.data);
        
        // Obtener el restaurante para tener todos los datos necesarios
        const restaurantResponse = await axios.get(
          `http://localhost:3001/public/restaurants/${restaurantSlug}`,
        );
        const restaurantData = restaurantResponse.data;
        
        // Extraer WhatsApp del phone si existe
        let whatsapp = '';
        if (restaurantData.phone && restaurantData.phone.includes('WhatsApp:')) {
          const whatsappMatch = restaurantData.phone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
          whatsapp = whatsappMatch ? whatsappMatch[1].trim() : '';
        }
        
        setRestaurant({
          ...restaurantData,
          whatsapp,
        });

        // Registrar vista del menú
        if (menuResponse.data?.id && restaurantData?.tenantId) {
          try {
            await axios.post('http://localhost:3001/tracking/menu-view', {
              menuId: menuResponse.data.id,
              restaurantId: restaurantData.id,
              tenantId: restaurantData.tenantId,
            });
          } catch (trackingErr) {
            // No mostrar error al usuario, solo loguear
            console.error('Error registrando vista:', trackingErr);
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Menú no encontrado');
        } else {
          setError(err.message || 'Error cargando el menú');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantSlug, menuSlug]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Menú no encontrado'}
        </div>
        <Link href="/" className="btn btn-primary mt-3">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Obtener el template del restaurante (el menú usa el template del restaurante)
  const template = menu.template || restaurant.template || 'classic';
  
  // Preparar el menú en el formato que esperan los templates
  const selectedMenu = {
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    ...(menu.description && { description: menu.description }),
    sections: menu.sections,
  };
  
  // Preparar la lista de menús (solo el menú actual)
  const menuList = [{
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    ...(menu.description && { description: menu.description }),
  }];

  // Renderizar según la plantilla usando los componentes de template
  if (template === 'classic') {
    return (
      <ClassicTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={() => {}}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  if (template === 'minimalist') {
    return (
      <MinimalistTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={() => {}}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  if (template === 'foodie') {
    return (
      <FoodieTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={() => {}}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  if (template === 'burgers') {
    return (
      <BurgersTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={() => {}}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  if (template === 'italianFood') {
    return (
      <ItalianFoodTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={() => {}}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Fallback a classic si el template no es reconocido
  return (
    <ClassicTemplate
      restaurant={restaurant}
      menuList={menuList}
      selectedMenu={selectedMenu}
      onMenuSelect={() => {}}
      formatPrice={formatPrice}
      formatWhatsAppForLink={formatWhatsAppForLink}
      iconLabels={iconLabels}
    />
  );
}
