import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getAllMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  toggleItemActive,
  updateItemStock,
  deleteMenuItem 
} from '../../api/api';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package,
  Save,
  X
} from 'lucide-react';

function OwnerMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    category: 'plato_principal',
    stock: '999',
    tags: '',
    badges: ''
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user || (user.role !== 'owner' && user.role !== 'admin'))) {
      navigate('/owner/login');
    } else if (user) {
      loadItems();
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const loadItems = async () => {
    try {
      const response = await getAllMenuItems({ includeDeleted: false });
      setItems(response.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando items:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      category: formData.category,
      stock: parseInt(formData.stock),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      badges: formData.badges ? formData.badges.split(',').map(b => b.trim()) : []
    };

    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, data);
      } else {
        await createMenuItem(data);
      }
      
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadItems();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      cost: item.cost?.toString() || '0',
      category: item.category,
      stock: item.stock.toString(),
      tags: item.tags?.join(', ') || '',
      badges: item.badges?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (item) => {
    try {
      await toggleItemActive(item._id);
      loadItems();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleStockUpdate = async (item, newStock) => {
    try {
      await updateItemStock(item._id, { stock: parseInt(newStock) });
      loadItems();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;

    try {
      await deleteMenuItem(item._id, false);
      loadItems();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      cost: '',
      category: 'plato_principal',
      stock: '999',
      tags: '',
      badges: ''
    });
  };

  const filteredItems = items.filter(item => {
    if (filter === 'active') return item.active;
    if (filter === 'inactive') return !item.active;
    if (filter === 'outofstock') return item.outOfStock;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/owner/dashboard')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Gestión de Menú</h1>
          <button
            className="btn btn-accent"
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={20} />
            Nuevo Item
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Todos ({items.length})
        </button>
        <button
          className={`btn ${filter === 'active' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setFilter('active')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Activos ({items.filter(i => i.active).length})
        </button>
        <button
          className={`btn ${filter === 'inactive' ? 'btn-outline' : 'btn-outline'}`}
          onClick={() => setFilter('inactive')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Inactivos ({items.filter(i => !i.active).length})
        </button>
        <button
          className={`btn ${filter === 'outofstock' ? 'btn-outline' : 'btn-outline'}`}
          onClick={() => setFilter('outofstock')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Sin Stock ({items.filter(i => i.outOfStock).length})
        </button>
      </div>

      {/* Lista de Items */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-light)' }}>No hay items para mostrar</p>
        </div>
      ) : (
        filteredItems.map(item => (
          <div key={item._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                  {!item.active && (
                    <span style={{ 
                      backgroundColor: 'var(--text-light)', 
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem'
                    }}>
                      INACTIVO
                    </span>
                  )}
                  {item.outOfStock && (
                    <span style={{ 
                      backgroundColor: 'var(--danger)', 
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem'
                    }}>
                      SIN STOCK
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>💰 Precio: <strong>${item.price.toLocaleString('es-CL')}</strong></span>
                  <span>📦 Stock: <strong>{item.stock}</strong></span>
                  <span>📁 {item.category}</span>
                </div>

                {item.badges && item.badges.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {item.badges.map(badge => (
                      <span key={badge} className="badge badge-popular">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => handleEdit(item)}
                  style={{ padding: '0.5rem' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`btn ${item.active ? 'btn-outline' : 'btn-success'}`}
                  onClick={() => handleToggleActive(item)}
                  style={{ padding: '0.5rem' }}
                  title={item.active ? 'Desactivar' : 'Activar'}
                >
                  {item.active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  className="btn"
                  onClick={() => handleDelete(item)}
                  style={{ padding: '0.5rem', backgroundColor: 'var(--danger)', color: 'white' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>{editingItem ? 'Editar Item' : 'Nuevo Item'}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Costo
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="plato_principal">Plato Principal</option>
                    <option value="postre">Postre</option>
                    <option value="bebida">Bebida</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Tags (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="vegano, sin gluten"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Badges (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.badges}
                  onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
                  placeholder="nuevo, recomendado, chef"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ flex: 1 }}
                >
                  <Save size={18} />
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerMenu;

