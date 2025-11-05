import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpenTables, markOrderServed } from '../api/api';
import { Clock, CheckCircle, RefreshCw, LogOut, Utensils, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOpenTablesChannel } from '../hooks/useSocket';

function WaiterOpenTables() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, hasRole, loading: authLoading } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);

  // WebSocket para actualizaciones en tiempo real
  const handleTableUpdated = useCallback(() => {
    // Recargar mesas cuando hay cambios
    loadOpenTables();
  }, []);

  const { isConnected } = useOpenTablesChannel(handleTableUpdated);

  useEffect(() => {
    // Esperar a que termine la carga de autenticación
    if (authLoading) return;

    // Verificar autenticación
    if (!isAuthenticated) {
      navigate('/staff/login', { state: { from: '/waiter/tables' } });
      return;
    }

    // Verificar rol
    if (!hasRole(['waiter', 'admin'])) {
      alert(`No tienes permisos para acceder al panel de garzón.\nTu rol actual es: ${user?.role}\n\nPor favor inicia sesión con una cuenta de garzón.`);
      logout();
      navigate('/staff/login', { state: { from: '/waiter/tables' } });
      return;
    }

    loadOpenTables();
    const interval = setInterval(loadOpenTables, 15000); // Refresh cada 15s como fallback
    return () => clearInterval(interval);
  }, [isAuthenticated, hasRole, navigate, authLoading, user, logout]);

  const loadOpenTables = async () => {
    try {
      const response = await getOpenTables();
      setTables(response.data.openTables || []);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando mesas abiertas:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/staff/login', { state: { from: '/waiter/tables' } });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'kitchen':
        return 'var(--warning)';
      case 'ready_to_serve':
        return 'var(--success)';
      case 'served':
        return 'var(--primary)';
      default:
        return 'var(--text-light)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'kitchen':
        return 'En Cocina';
      case 'ready_to_serve':
        return 'Listo para Servir';
      case 'served':
        return 'Servido';
      case 'awaiting_approval':
        return 'Pendiente Aprobación';
      default:
        return status;
    }
  };

  const handleMarkServed = async (orderId) => {
    if (!confirm('¿Marcar esta orden como servida?')) return;

    try {
      await markOrderServed(orderId);
      loadOpenTables();
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>🪑 Mesas Abiertas</h1>
          {user && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              {user.name} ({user.role})
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Indicador WebSocket */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            backgroundColor: isConnected ? '#f0fff4' : '#fff5f5',
            border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: '8px',
            fontSize: '0.75rem'
          }}>
            {isConnected ? (
              <>
                <Wifi size={12} color="var(--success)" />
                <span style={{ color: 'var(--success)' }}>Live</span>
              </>
            ) : (
              <>
                <WifiOff size={12} color="var(--danger)" />
              </>
            )}
          </div>
          
          <button
            className="btn btn-outline"
            onClick={loadOpenTables}
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

      {/* Stats Summary */}
      {tables.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🪑</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {tables.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Mesas Activas</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📦</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {tables.reduce((sum, t) => sum + t.totalItems, 0)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Items Totales</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {tables.filter(t => t.mainStatus === 'ready_to_serve').length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Listos</div>
          </div>
        </div>
      )}

      {/* Lista de Mesas */}
      {tables.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Utensils size={48} color="var(--text-light)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>✅ Sin mesas activas</h3>
          <p style={{ color: 'var(--text-light)' }}>
            No hay mesas con pedidos pendientes
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tables.map(table => {
            const hasNewItems = table.hasNewItems;
            const readyToServe = table.mainStatus === 'ready_to_serve';
            
            return (
              <div
                key={table.tableId}
                className="card"
                style={{
                  border: `2px solid ${readyToServe ? 'var(--success)' : hasNewItems ? 'var(--warning)' : 'var(--border)'}`,
                  backgroundColor: readyToServe ? '#f0fff4' : hasNewItems ? '#fffacd' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                      Mesa {table.tableNumber}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {table.area}  •  {table.orderCount} orden(es)
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: getStatusColor(table.mainStatus),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    height: 'fit-content'
                  }}>
                    {getStatusLabel(table.mainStatus)}
                  </div>
                </div>

                {/* Items por estado */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>
                      {table.itemsByStatus.pending}
                    </div>
                    <div style={{ color: 'var(--text-light)' }}>Pendientes</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--warning)' }}>
                      {table.itemsByStatus.kitchen}
                    </div>
                    <div style={{ color: 'var(--text-light)' }}>Cocina</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                      {table.itemsByStatus.ready_to_serve}
                    </div>
                    <div style={{ color: 'var(--text-light)' }}>Listos</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      {table.itemsByStatus.served}
                    </div>
                    <div style={{ color: 'var(--text-light)' }}>Servidos</div>
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 'bold' }}>Total Acumulado:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    ${table.totalAmount?.toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedTable(selectedTable === table.tableId ? null : table.tableId)}
                  >
                    {selectedTable === table.tableId ? 'Ocultar' : 'Ver'} Órdenes
                  </button>
                  {readyToServe && table.orders && table.orders[0] && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleMarkServed(table.orders[0]._id)}
                    >
                      <CheckCircle size={18} />
                      Marcar Servido
                    </button>
                  )}
                </div>

                {/* Lista de órdenes (expandible) */}
                {selectedTable === table.tableId && table.orders && (
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '2px dashed var(--border)' 
                  }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-light)' }}>
                      Órdenes de esta mesa:
                    </h4>
                    {table.orders.map((order, idx) => (
                      <div
                        key={order._id}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--secondary)',
                          borderRadius: '8px',
                          marginBottom: idx < table.orders.length - 1 ? '0.5rem' : 0
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Orden #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {order.itemCount} items
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            borderRadius: '4px'
                          }}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ${order.total?.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WaiterOpenTables;

