import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

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

interface Menu {
  id: string;
  name: string;
  description?: string;
  template: string;
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
  const { id } = router.query;
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/public/menus/${id}`,
        );
        setMenu(response.data);
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

    fetchMenu();
  }, [id]);

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

  // Renderizar según la plantilla
  const renderMenu = () => {
    switch (menu.template) {
      case 'modern':
        return renderModernTemplate();
      case 'foodie':
        return renderFoodieTemplate();
      case 'classic':
      default:
        return renderClassicTemplate();
    }
  };

  const renderClassicTemplate = () => {
    return (
      <div className="container mt-4">
        <div className="text-center mb-4">
          <Link href={`/r/${menu.restaurantSlug}`} className="btn btn-link">
            ← Volver a {menu.restaurantName}
          </Link>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h1 className="card-title text-center">{menu.name}</h1>
            {menu.description && (
              <p className="card-text text-center text-muted">{menu.description}</p>
            )}
            
            <hr />
            
            {menu.sections.length === 0 ? (
              <div className="alert alert-info mt-3">
                <p>El menú está siendo actualizado. Vuelve pronto.</p>
              </div>
            ) : (
              menu.sections.map((section) => (
                <div key={section.id} className="mt-4">
                  <h2 className="border-bottom pb-2">{section.name}</h2>
                  <div className="row">
                    {section.items.map((item) => (
                      <div key={item.id} className="col-md-6 mb-4">
                        <div className="card h-100">
                          {item.photos && item.photos.length > 0 && (
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              className="card-img-top"
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                          )}
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title">{item.name}</h5>
                              {item.icons.length > 0 && (
                                <div>
                                  {item.icons.map((icon) => (
                                    <span key={icon} className="badge bg-info me-1" title={iconLabels[icon] || icon}>
                                      {iconLabels[icon] || icon}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <p className="card-text text-muted">{item.description}</p>
                            )}
                            <div className="mt-2">
                              {item.prices.map((price, idx) => (
                                <span key={idx} className="badge bg-primary me-2">
                                  {price.label && `${price.label}: `}
                                  {price.currency} {price.amount}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModernTemplate = () => {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px 0' }}>
        <div className="container">
          <div className="text-center mb-4">
            <Link href={`/r/${menu.restaurantSlug}`} className="btn btn-link">
              ← Volver a {menu.restaurantName}
            </Link>
          </div>
          
          <div className="card shadow-lg" style={{ borderRadius: '16px', border: 'none' }}>
            <div className="card-body p-5">
              <h1 className="text-center mb-3" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                {menu.name}
              </h1>
              {menu.description && (
                <p className="text-center text-muted mb-5">{menu.description}</p>
              )}
              
              {menu.sections.length === 0 ? (
                <div className="alert alert-info mt-3">
                  <p>El menú está siendo actualizado. Vuelve pronto.</p>
                </div>
              ) : (
                menu.sections.map((section) => (
                  <div key={section.id} className="mt-5">
                    <h2 className="mb-4" style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333' }}>
                      {section.name}
                    </h2>
                    <div className="row g-4">
                      {section.items.map((item) => (
                        <div key={item.id} className="col-md-6">
                          <div className="card h-100" style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}>
                            {item.photos && item.photos.length > 0 && (
                              <img 
                                src={item.photos[0]} 
                                alt={item.name}
                                style={{ height: '220px', objectFit: 'cover' }}
                              />
                            )}
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title" style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                                  {item.name}
                                </h5>
                                {item.icons.length > 0 && (
                                  <div>
                                    {item.icons.map((icon) => (
                                      <span key={icon} className="badge bg-light text-dark me-1" title={iconLabels[icon] || icon}>
                                        {iconLabels[icon] || icon}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {item.description && (
                                <p className="card-text text-muted mb-3">{item.description}</p>
                              )}
                              <div className="mt-auto">
                                {item.prices.map((price, idx) => (
                                  <span key={idx} className="badge bg-dark me-2" style={{ fontSize: '1rem', padding: '8px 12px' }}>
                                    {price.label && `${price.label}: `}
                                    {price.currency} {price.amount}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFoodieTemplate = () => {
    return (
      <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '20px 0', color: '#fff' }}>
        <div className="container">
          <div className="text-center mb-4">
            <Link href={`/r/${menu.restaurantSlug}`} className="btn btn-outline-light">
              ← Volver a {menu.restaurantName}
            </Link>
          </div>
          
          <div className="card" style={{ backgroundColor: '#2a2a2a', border: 'none', borderRadius: '20px' }}>
            <div className="card-body p-5">
              <h1 className="text-center mb-3" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
                {menu.name}
              </h1>
              {menu.description && (
                <p className="text-center text-muted mb-5" style={{ fontSize: '1.2rem' }}>
                  {menu.description}
                </p>
              )}
              
              {menu.sections.length === 0 ? (
                <div className="alert alert-warning mt-3">
                  <p>El menú está siendo actualizado. Vuelve pronto.</p>
                </div>
              ) : (
                menu.sections.map((section) => (
                  <div key={section.id} className="mt-5">
                    <h2 className="mb-4" style={{ fontSize: '2rem', fontWeight: '600', color: '#ffd700', borderBottom: '2px solid #ffd700', paddingBottom: '10px' }}>
                      {section.name}
                    </h2>
                    <div className="row g-4">
                      {section.items.map((item) => (
                        <div key={item.id} className="col-md-6">
                          <div className="card h-100" style={{ backgroundColor: '#333', border: 'none', borderRadius: '15px', overflow: 'hidden' }}>
                            {item.photos && item.photos.length > 0 && (
                              <img 
                                src={item.photos[0]} 
                                alt={item.name}
                                style={{ height: '250px', objectFit: 'cover' }}
                              />
                            )}
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="card-title" style={{ fontSize: '1.4rem', fontWeight: '600', color: '#fff' }}>
                                  {item.name}
                                </h5>
                                {item.icons.length > 0 && (
                                  <div>
                                    {item.icons.map((icon) => (
                                      <span key={icon} className="badge bg-warning text-dark me-1" title={iconLabels[icon] || icon}>
                                        {iconLabels[icon] || icon}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {item.description && (
                                <p className="card-text text-muted mb-3" style={{ color: '#aaa' }}>
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-auto">
                                {item.prices.map((price, idx) => (
                                  <span key={idx} className="badge bg-warning text-dark me-2" style={{ fontSize: '1.1rem', padding: '10px 15px' }}>
                                    {price.label && `${price.label}: `}
                                    {price.currency} {price.amount}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderMenu();
}

