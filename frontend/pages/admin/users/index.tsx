import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';

interface UserStats {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  tenantId: string | null;
  tenantName: string | null;
  subscriptionPlan: string | null;
  restaurantCount: number;
  menuCount: number;
  activeProductCount: number;
  inactiveProductCount: number;
}

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCurrentUser({ id: parsed.id, role: parsed.role });
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filterEmail, page, itemsPerPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterEmail) {
        params.email = filterEmail;
      }
      if (itemsPerPage) {
        params.limit = itemsPerPage;
        params.offset = (page - 1) * itemsPerPage;
      }
      const res = await api.get('/users', { params });
      if (res.data.data && res.data.total !== undefined) {
        setUsers(res.data.data);
        setTotal(res.data.total);
      } else {
        // Compatibilidad con respuestas antiguas
        setUsers(res.data);
        setTotal(res.data.length);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: UserStats) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/users/${user.id}/details`);
      setUserDetails(res.data);
    } catch (error) {
      console.error('Error cargando detalles del usuario:', error);
      setUserDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleActive = async (e: React.MouseEvent, user: UserStats) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentUser?.id === user.id) return;
    setActionLoading(user.id);
    try {
      await api.patch(`/users/${user.id}/active`, { isActive: !user.isActive });
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, user: UserStats) => {
    e.stopPropagation();
    if (currentUser?.id === user.id) return;
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(userToDelete.id);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanBadgeClass = (plan: string | null) => {
    if (!plan) return 'bg-secondary';
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-success';
      case 'basic':
        return 'bg-primary';
      case 'free':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  };

  const getPlanLabel = (plan: string | null) => {
    if (!plan) return 'N/A';
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Básico';
      case 'free':
        return 'Gratis';
      default:
        return plan;
    }
  };

  const getTemplateLabel = (template: string) => {
    const templates: { [key: string]: string } = {
      classic: 'Clásico',
      minimalist: 'Minimalista',
      foodie: 'Foodie',
      burgers: 'Burgers',
      italianFood: 'Italian Food',
    };
    return templates[template] || template;
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="admin-title">Usuarios</h1>
      </div>

      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="filterEmail" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
            Filtrar por email:
          </label>
          <input
            id="filterEmail"
            type="email"
            className="form-control"
            placeholder="email@ejemplo.com"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            style={{ width: '300px' }}
          />
          {filterEmail && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setFilterEmail('')}
              title="Limpiar filtro"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tenant</th>
                <th>Suscripción</th>
                <th>Estado</th>
                <th>Restaurantes</th>
                <th>Menús</th>
                <th>PA</th>
                <th>PI</th>
                {currentUser?.role === 'SUPER_ADMIN' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'SUPER_ADMIN' ? 9 : 8} className="text-center text-muted">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(user)}>
                    <td>
                      <strong>{user.email}</strong>
                      {(user.firstName || user.lastName) && (
                        <div className="small text-muted">
                          {user.firstName} {user.lastName}
                        </div>
                      )}
                    </td>
                    <td>
                      {user.tenantName ? (
                        <span className="badge bg-info">{user.tenantName}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getPlanBadgeClass(user.subscriptionPlan)}`}>
                        {getPlanLabel(user.subscriptionPlan)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary">{user.restaurantCount}</span>
                    </td>
                    <td>
                      <span className="badge bg-info">{user.menuCount}</span>
                    </td>
                    <td>
                      <span className="badge bg-success">{user.activeProductCount}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{user.inactiveProductCount}</span>
                    </td>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={user.isActive}
                              disabled={currentUser?.id === user.id || actionLoading === user.id}
                              readOnly
                              onClick={(e) => handleToggleActive(e as any, user)}
                            />
                            <label className="form-check-label small">
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </label>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={currentUser?.id === user.id || actionLoading === user.id}
                            onClick={(e) => handleDeleteClick(e, user)}
                            title="Eliminar usuario"
                          >
                            {actionLoading === user.id ? (
                              <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                              'Borrar'
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {total > itemsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            <span className="text-muted">
              Mostrando {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, total)} de {total}
            </span>
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Anterior
                </button>
              </li>
              {Array.from({ length: Math.ceil(total / itemsPerPage) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(total / itemsPerPage) || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  </React.Fragment>
                ))}
              <li className={`page-item ${page >= Math.ceil(total / itemsPerPage) ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / itemsPerPage)}>
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal confirmar borrado */}
      {showDeleteConfirm && userToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar usuario</h5>
                <button type="button" className="btn-close" onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }} />
              </div>
              <div className="modal-body">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.email}</strong>? Esta acción no se puede deshacer.
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" disabled={actionLoading === userToDelete.id} onClick={handleConfirmDelete}>
                  {actionLoading === userToDelete.id ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del usuario */}
      {showDetailsModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '90%' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalles de {selectedUser.email}
                  {(selectedUser.firstName || selectedUser.lastName) && (
                    <span className="text-muted"> ({selectedUser.firstName} {selectedUser.lastName})</span>
                  )}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {loadingDetails ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : userDetails ? (
                  <>
                    {/* Restaurantes */}
                    <div className="mb-4">
                      <h6 className="mb-3">Restaurantes ({userDetails.restaurants.length})</h6>
                      {userDetails.restaurants.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Plantilla</th>
                                <th>Estado</th>
                                <th>Menús</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.restaurants.map((restaurant: any) => (
                                <tr key={restaurant.id}>
                                  <td>{restaurant.name}</td>
                                  <td>
                                    <span className="badge bg-info">
                                      {getTemplateLabel(restaurant.template)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${restaurant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                      {restaurant.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </td>
                                  <td>{restaurant.menuCount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No hay restaurantes</p>
                      )}
                    </div>

                    {/* Menús */}
                    <div className="mb-4">
                      <h6 className="mb-3">Menús ({userDetails.menus.length})</h6>
                      {userDetails.menus.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Restaurante</th>
                                <th>Plantilla</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.menus.map((menu: any) => (
                                <tr key={menu.id}>
                                  <td>{menu.name}</td>
                                  <td>{menu.restaurantName}</td>
                                  <td>
                                    <span className="badge bg-info">
                                      {getTemplateLabel(menu.restaurantTemplate)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      menu.status === 'PUBLISHED' ? 'bg-success' : 
                                      menu.status === 'DRAFT' ? 'bg-warning' : 'bg-secondary'
                                    }`}>
                                      {menu.status === 'PUBLISHED' ? 'Publicado' : 
                                       menu.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No hay menús</p>
                      )}
                    </div>

                    {/* Productos */}
                    <div className="mb-4">
                      <h6 className="mb-3">Productos ({userDetails.products.length})</h6>
                      {userDetails.products.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Menú</th>
                                <th>Restaurante</th>
                                <th>Plantilla</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.products.map((product: any) => (
                                <tr key={product.id}>
                                  <td>{product.name}</td>
                                  <td>{product.menuName}</td>
                                  <td>{product.restaurantName}</td>
                                  <td>
                                    <span className="badge bg-info">
                                      {getTemplateLabel(product.restaurantTemplate)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'}`}>
                                      {product.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No hay productos</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-danger">Error al cargar los detalles del usuario</p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

