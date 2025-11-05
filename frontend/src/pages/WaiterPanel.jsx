import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingOrders, approveOrder, getWaiterQueue, markOrderServed } from '../api/api';
import { CheckCircle, Clock, RefreshCw, Package, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function WaiterPanel() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, hasRole, loading: authLoading } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' o 'ready'

  useEffect(() => {
    // Esperar a que termine la carga de autenticación
    if (authLoading) return;

    // Verificar autenticación
    if (!isAuthenticated) {
      navigate('/staff/login', { state: { from: '/waiter' } });
      return;
    }

    // Verificar rol - si no tiene el rol correcto, hacer logout y pedir login
    if (!hasRole(['waiter', 'admin'])) {
      alert(`No tienes permisos para acceder al panel de garzón.\nTu rol actual es: ${user?.role}\n\nPor favor inicia sesión con una cuenta de garzón.`);
      logout(); // Cerrar sesión del usuario incorrecto
      navigate('/staff/login', { state: { from: '/waiter' } });
      return;
    }

    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Auto-refresh cada 5s
    return () => clearInterval(interval);
  }, [isAuthenticated, hasRole, navigate, authLoading, user, logout]);

  const loadOrders = async () => {
    try {
      // Cargar pedidos pendientes de aprobación
      const pendingResponse = await getPendingOrders();
      setPendingOrders(pendingResponse.data.orders);

      // Cargar pedidos listos para servir
      const readyResponse = await getWaiterQueue('ready_to_serve');
      setReadyOrders(readyResponse.data.orders);

      setLoading(false);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/staff/login', { state: { from: '/waiter' } });
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      logout();
      navigate('/staff/login');
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
      alert('✅ Orden aprobada y enviada a cocina');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMarkServed = async (orderId) => {
    if (!confirm('¿Marcar esta orden como servida?')) return;

    try {
      await markOrderServed(orderId);
      loadOrders();
      alert('✅ Orden marcada como servida. El cliente ya puede pagar.');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Panel Garzón</h1>
          {user && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              {user.name} ({user.role})
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline"
            onClick={loadOrders}
            style={{ padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={18} />
          </button>
          <button
            className="btn btn-outline"
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem' }}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('pending')}
          style={{ flex: 1 }}
        >
          <Clock size={18} />
          Aprobar ({pendingOrders.length})
        </button>
        <button
          className={`btn ${activeTab === 'ready' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setActiveTab('ready')}
          style={{ flex: 1 }}
        >
          <Package size={18} />
          Para Servir ({readyOrders.length})
        </button>
      </div>

      {/* Vista de Pendientes de Aprobación */}
      {activeTab === 'pending' && (
        <>
          {pendingOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>✅ Todo al día</h3>
              <p style={{ color: 'var(--text-light)' }}>
                No hay pedidos pendientes de aprobación
              </p>
            </div>
          ) : (
            pendingOrders.map(order => (
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
        </>
      )}

      {/* Vista de Listos para Servir */}
      {activeTab === 'ready' && (
        <>
          {readyOrders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>✅ Sin pedidos listos</h3>
              <p style={{ color: 'var(--text-light)' }}>
                No hay pedidos listos para servir
              </p>
            </div>
          ) : (
            readyOrders.map(order => (
              <div key={order._id} className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3>Mesa {order.tableId?.number}</h3>
                    <span style={{ 
                      backgroundColor: 'var(--success)', 
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      ✓ LISTO
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    Preparado hace {Math.floor((Date.now() - new Date(order.updatedAt)) / 60000)} min
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
                      <span style={{ fontWeight: 'bold' }}>
                        {item.quantity}x {item.itemId?.name || 'Item'}
                        {item.notes && (
                          <span style={{ 
                            display: 'block', 
                            fontSize: '0.85rem', 
                            color: 'var(--text-light)',
                            fontStyle: 'italic',
                            fontWeight: 'normal'
                          }}>
                            📝 {item.notes}
                          </span>
                        )}
                      </span>
                      <span style={{ 
                        backgroundColor: 'var(--success)', 
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem'
                      }}>
                        LISTO
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
                  onClick={() => handleMarkServed(order._id)}
                >
                  <CheckCircle size={20} />
                  Marcar como Servido
                </button>
              </div>
            ))
          )}
        </>
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

