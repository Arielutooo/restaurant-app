import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { createOrder } from '../api/api';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';

function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        tableId: session.tableId,
        sessionId: session.sessionId,
        items: items.map(item => ({
          itemId: item._id,
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        requiresApproval
      };

      const response = await createOrder(orderData);
      const order = response.data.order;

      clearCart();
      
      // Redirigir a pago
      navigate('/payment', { state: { orderId: order._id } });
    } catch (err) {
      alert('Error al crear el pedido: ' + err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/menu')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} />
          Volver al menú
        </button>

        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>🛒 Carrito vacío</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
            Agrega algunos platos desde el menú
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Ver menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '8rem' }}>
      <button 
        className="btn btn-outline"
        onClick={() => navigate('/menu')}
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      >
        <ArrowLeft size={18} />
        Volver al menú
      </button>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Tu pedido
      </h1>

      {items.map(item => (
        <div key={item._id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {item.name}
              </h3>
              <p style={{ 
                color: 'var(--accent)', 
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                ${item.price.toLocaleString('es-CL')} × {item.quantity}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  style={{ padding: '0.5rem' }}
                >
                  <Minus size={16} />
                </button>
                
                <span style={{ 
                  minWidth: '40px', 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {item.quantity}
                </span>
                
                <button
                  className="btn btn-outline"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  style={{ padding: '0.5rem' }}
                >
                  <Plus size={16} />
                </button>

                <button
                  className="btn"
                  onClick={() => removeItem(item._id)}
                  style={{ 
                    padding: '0.5rem',
                    marginLeft: 'auto',
                    backgroundColor: 'var(--danger)',
                    color: 'white'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="card" style={{ 
        backgroundColor: 'var(--primary)', 
        color: 'white',
        marginTop: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '1.25rem',
          fontWeight: 'bold'
        }}>
          <span>Total</span>
          <span>${getTotal().toLocaleString('es-CL')}</span>
        </div>
      </div>

      <div className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) => setRequiresApproval(e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
          <span>Requiere aprobación del garzón</span>
        </label>
      </div>

      <button
        className="btn btn-success btn-full"
        onClick={handleCheckout}
        disabled={loading}
        style={{ 
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          maxWidth: '568px',
          margin: '0 auto',
          fontSize: '1.1rem',
          padding: '1.25rem'
        }}
      >
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}

export default Cart;

