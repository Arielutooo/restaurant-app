import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useCart } from '../context/CartContext';
import { getMenu } from '../api/api';
import { ShoppingCart, Plus } from 'lucide-react';

function Menu() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { addItem, getItemCount } = useCart();
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    loadMenu();
  }, [session]);

  const loadMenu = async () => {
    try {
      const response = await getMenu();
      setMenu(response.data.menu);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando menú:', err);
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addItem(item, 1);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const categoryNames = {
    entrada: 'Entradas',
    plato_principal: 'Platos Principales',
    postre: 'Postres',
    bebida: 'Bebidas',
    otro: 'Otros'
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        backgroundColor: 'var(--secondary)', 
        padding: '1rem 0',
        zIndex: 10,
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>Menú</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Mesa {session?.tableNumber}
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/cart')}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={20} />
            {getItemCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {Object.entries(menu).map(([category, items]) => (
        <div key={category} style={{ marginTop: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            marginBottom: '1rem',
            color: 'var(--primary)'
          }}>
            {categoryNames[category] || category}
          </h2>

          {items.map(item => (
            <div key={item._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                    {item.badges?.map(badge => (
                      <span 
                        key={badge} 
                        className={`badge badge-${
                          badge === 'nuevo' ? 'new' : 
                          badge === 'más pedido' ? 'popular' : 
                          'chef'
                        }`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  <p style={{ 
                    color: 'var(--text-light)', 
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem'
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold',
                      color: 'var(--accent)'
                    }}>
                      ${item.price.toLocaleString('es-CL')}
                    </span>
                    
                    <button
                      className="btn btn-accent"
                      onClick={() => handleAddToCart(item)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Plus size={18} />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {Object.keys(menu).length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-light)' }}>
            No hay items disponibles en el menú
          </p>
        </div>
      )}
    </div>
  );
}

export default Menu;

