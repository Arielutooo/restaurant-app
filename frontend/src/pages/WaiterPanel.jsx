import React, { useState, useEffect } from 'react';
import { getPendingOrders, approveOrder } from '../api/api';
import { CheckCircle, Clock, RefreshCw } from 'lucide-react';

function WaiterPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Auto-refresh cada 5s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getPendingOrders();
      setOrders(response.data.orders);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setLoading(false);
    }
  };

  const handleApproveClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowPinModal(true);
  };

  const handleApprove = async () => {
    if (!pin) {
      alert('Ingresa tu PIN');
      return;
    }

    try {
      await approveOrder(selectedOrderId, pin);
      setShowPinModal(false);
      setPin('');
      setSelectedOrderId(null);
      loadOrders();
      alert('✅ Orden aprobada');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
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

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ fontSize: '1.5rem' }}>Panel Garzón</h1>
        <button 
          className="btn btn-outline"
          onClick={loadOrders}
          style={{ padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--warning)', color: 'white', marginBottom: '1.5rem' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} />
          <strong>{orders.length}</strong> pedidos pendientes de aprobación
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>✅ Todo al día</h3>
          <p style={{ color: 'var(--text-light)' }}>
            No hay pedidos pendientes de aprobación
          </p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3>Mesa {order.tableId?.number}</h3>
                <span style={{ 
                  backgroundColor: 'var(--warning)', 
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  PENDIENTE
                </span>
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                {new Date(order.createdAt).toLocaleString('es-CL')}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                Items:
              </h4>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span>
                    {item.quantity}x {item.itemId?.name || 'Item'}
                    {item.notes && (
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.85rem', 
                        color: 'var(--text-light)',
                        fontStyle: 'italic'
                      }}>
                        Nota: {item.notes}
                      </span>
                    )}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '1rem 0',
              borderTop: '2px solid var(--primary)',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent)' }}>
                ${order.total?.toLocaleString('es-CL')}
              </span>
            </div>

            <button
              className="btn btn-success btn-full"
              onClick={() => handleApproveClick(order._id)}
            >
              <CheckCircle size={20} />
              Aprobar pedido
            </button>
          </div>
        ))
      )}

      {/* PIN Modal */}
      {showPinModal && (
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
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '90%', 
            maxWidth: '400px',
            padding: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Ingresa tu PIN</h3>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN de garzón"
              autoFocus
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                letterSpacing: '0.5rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                }}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success"
                onClick={handleApprove}
                style={{ flex: 1 }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaiterPanel;

