import React, { useState, useEffect } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../api/api';
import { Clock, CheckCircle, RefreshCw } from 'lucide-react';

function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000); // Auto-refresh cada 3s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getKitchenOrders();
      setOrders(response.data.orders);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'kitchen':
        return 'var(--warning)';
      case 'ready':
        return 'var(--success)';
      default:
        return 'var(--text-light)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'kitchen':
        return 'EN PREPARACIÓN';
      case 'ready':
        return 'LISTO';
      default:
        return status.toUpperCase();
    }
  };

  const getElapsedTime = (createdAt) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return minutes;
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

  const kitchenOrders = orders.filter(o => o.status === 'kitchen');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ fontSize: '1.5rem' }}>🍳 Cocina (KDS)</h1>
        <button
          className="btn btn-outline"
          onClick={loadOrders}
          style={{ padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* En preparación */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock size={24} color="var(--warning)" />
          En preparación ({kitchenOrders.length})
        </h2>

        {kitchenOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-light)' }}>
              No hay pedidos en preparación
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {kitchenOrders.map(order => {
              const elapsed = getElapsedTime(order.createdAt);
              const isDelayed = elapsed > 15;

              return (
                <div 
                  key={order._id} 
                  className="card" 
                  style={{ 
                    border: isDelayed ? '3px solid var(--danger)' : '2px solid var(--warning)',
                    backgroundColor: isDelayed ? '#fff5f5' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        Mesa {order.tableId?.number}
                      </h3>
                      <p style={{ 
                        color: isDelayed ? 'var(--danger)' : 'var(--text-light)', 
                        fontSize: '0.9rem',
                        fontWeight: isDelayed ? 'bold' : 'normal'
                      }}>
                        ⏱️ {elapsed} min
                        {isDelayed && ' ⚠️ RETRASADO'}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      height: 'fit-content'
                    }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{
                        padding: '0.75rem 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          fontWeight: 'bold'
                        }}>
                          <span>{item.quantity}x</span>
                          <span>{item.itemId?.name || 'Item'}</span>
                        </div>
                        {item.notes && (
                          <div style={{
                            marginTop: '0.25rem',
                            padding: '0.5rem',
                            backgroundColor: '#fffacd',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontStyle: 'italic'
                          }}>
                            📝 {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-success btn-full"
                    onClick={() => handleStatusChange(order._id, 'ready')}
                  >
                    <CheckCircle size={18} />
                    Marcar como listo
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Listos para servir */}
      <div>
        <h2 style={{
          fontSize: '1.2rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={24} color="var(--success)" />
          Listos para servir ({readyOrders.length})
        </h2>

        {readyOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-light)' }}>
              No hay pedidos listos
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {readyOrders.map(order => (
              <div
                key={order._id}
                className="card"
                style={{
                  border: '2px solid var(--success)',
                  backgroundColor: '#f0fff4'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    Mesa {order.tableId?.number}
                  </h3>
                  <span style={{
                    backgroundColor: var(--success),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ LISTO
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{
                      padding: '0.5rem 0',
                      borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none',
                      fontWeight: 'bold'
                    }}>
                      {item.quantity}x {item.itemId?.name || 'Item'}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-outline btn-full"
                  onClick={() => handleStatusChange(order._id, 'served')}
                >
                  Marcar como servido
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenDisplay;

