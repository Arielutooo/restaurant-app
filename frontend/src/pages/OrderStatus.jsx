import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChefHat, CheckCircle, CreditCard, Package, Wifi, WifiOff } from 'lucide-react';
import { useOrderChannel } from '../hooks/useSocket';
import { getOrderDetails } from '../api/api';

function OrderStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderStatus: initialStatus } = location.state || {};
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [itemCount, setItemCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Callback para actualizar cuando llega evento WebSocket
  const handleOrderUpdated = useCallback((data) => {
    console.log('🔄 Orden actualizada en tiempo real:', data);
    if (data.status) {
      setStatus(data.status);
    }
    if (data.total !== undefined) {
      setTotalAmount(data.total);
    }
    if (data.itemCount !== undefined) {
      setItemCount(data.itemCount);
    }
    
    // Si cambió a "served", mostrar notificación
    if (data.status === 'served' && data.canPay) {
      // Opcional: mostrar toast de éxito
      console.log('✅ ¡Tu pedido ha sido servido! Ya puedes pagar.');
    }
  }, []);

  const handleItemAdded = useCallback((data) => {
    console.log('➕ Item agregado:', data);
    // Se actualizará con el próximo fetch automático
  }, []);

  // Conectar WebSocket
  const { isConnected } = useOrderChannel(
    orderId,
    handleOrderUpdated,
    handleItemAdded,
    null
  );

  // Fetch inicial de la orden
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const response = await getOrderDetails(orderId);
      const order = response.data.order;
      setStatus(order.status);
      setItemCount(order.items?.length || 0);
      setTotalAmount(order.totals?.grandTotal || order.total || 0);
    } catch (error) {
      console.error('Error al obtener detalles de la orden:', error);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // Fetch inicial
    fetchOrderDetails();

    // Fallback: polling cada 10s si WebSocket no está conectado
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchOrderDetails();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, navigate, fetchOrderDetails, isConnected]);

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
      case 'awaiting_approval':
        return {
          icon: <Clock size={64} color="var(--warning)" />,
          title: 'Esperando Confirmación',
          message: 'Tu pedido está siendo revisado por nuestro personal',
          color: 'var(--warning)',
          canPay: false
        };
      case 'kitchen':
        return {
          icon: <ChefHat size={64} color="var(--accent)" />,
          title: 'En Preparación',
          message: 'Nuestro chef está preparando tu pedido',
          color: 'var(--accent)',
          canPay: false
        };
      case 'ready_to_serve':
        return {
          icon: <Package size={64} color="var(--success)" />,
          title: 'Listo para Servir',
          message: 'Tu pedido está listo. El garzón lo llevará en breve a tu mesa',
          color: 'var(--success)',
          canPay: false
        };
      case 'served':
        return {
          icon: <CheckCircle size={64} color="var(--success)" />,
          title: '¡Pedido Servido!',
          message: 'Tu pedido ha sido entregado. Ya puedes proceder con el pago',
          color: 'var(--success)',
          canPay: true
        };
      default:
        return {
          icon: <Clock size={64} color="var(--text-light)" />,
          title: 'Procesando...',
          message: 'Estamos procesando tu pedido',
          color: 'var(--text-light)',
          canPay: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handlePayment = () => {
    navigate('/payment', { 
      state: { 
        orderId, 
        orderStatus: status 
      } 
    });
  };

  const steps = [
    { key: 'awaiting_approval', label: 'Confirmación', active: ['awaiting_approval', 'kitchen', 'ready_to_serve', 'served'].includes(status) },
    { key: 'kitchen', label: 'Preparación', active: ['kitchen', 'ready_to_serve', 'served'].includes(status) },
    { key: 'ready_to_serve', label: 'Listo', active: ['ready_to_serve', 'served'].includes(status) },
    { key: 'served', label: 'Servido', active: status === 'served' }
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Indicador de conexión WebSocket */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: isConnected ? '#f0fff4' : '#fff5f5',
        border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}`,
        borderRadius: '20px',
        fontSize: '0.75rem'
      }}>
        {isConnected ? (
          <>
            <Wifi size={14} color="var(--success)" />
            <span style={{ color: 'var(--success)' }}>Tiempo real</span>
          </>
        ) : (
          <>
            <WifiOff size={14} color="var(--danger)" />
            <span style={{ color: 'var(--danger)' }}>Reconectando...</span>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          {statusInfo.icon}
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: statusInfo.color }}>
          {statusInfo.title}
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
          {statusInfo.message}
        </p>

        {/* Progress Steps */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '2rem auto',
          maxWidth: '500px',
          position: 'relative'
        }}>
          {/* Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '10%',
            right: '10%',
            height: '4px',
            backgroundColor: 'var(--border)',
            zIndex: 0
          }}>
            <div style={{
              height: '100%',
              backgroundColor: statusInfo.color,
              width: `${(steps.filter(s => s.active).length / steps.length) * 100}%`,
              transition: 'width 0.5s'
            }} />
          </div>

          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.key} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              zIndex: 1,
              flex: 1
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step.active ? statusInfo.color : 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: 'white',
                transition: 'all 0.3s'
              }}>
                {step.active ? '✓' : index + 1}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: step.active ? statusInfo.color : 'var(--text-light)',
                fontWeight: step.active ? 'bold' : 'normal',
                textAlign: 'center'
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="card" style={{ 
          marginTop: '2rem',
          backgroundColor: statusInfo.canPay ? '#f0fff4' : '#fff9e6',
          border: `2px solid ${statusInfo.color}`
        }}>
          {statusInfo.canPay ? (
            <>
              <div style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                color: 'var(--success)'
              }}>
                💳 Listo para Pagar
              </div>
              <p style={{ marginBottom: '1rem' }}>
                Tu pedido ha sido servido. Puedes proceder con el pago cuando estés listo.
              </p>
              <button
                className="btn btn-success btn-full"
                onClick={handlePayment}
                style={{ fontSize: '1.1rem', padding: '1rem' }}
              >
                <CreditCard size={20} />
                Proceder al Pago
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                ⏳ Un momento...
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                El pago estará disponible una vez que tu pedido sea servido en tu mesa.
                <br />
                Recibirás una notificación en esta pantalla.
              </p>
            </>
          )}
        </div>

        {/* Order ID */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--secondary)',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            Código de orden
          </p>
          <p style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.2rem', 
            fontWeight: 'bold',
            color: 'var(--primary)'
          }}>
            #{orderId?.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Refresh hint */}
        <p style={{ 
          marginTop: '1.5rem', 
          fontSize: '0.85rem', 
          color: 'var(--text-light)',
          fontStyle: 'italic'
        }}>
          {isConnected 
            ? '✅ Conectado en tiempo real - Los cambios aparecerán automáticamente' 
            : '⏱️ Se actualiza cada 10 segundos (sin conexión en tiempo real)'}
        </p>
        
        {/* Botón para agregar más items */}
        {statusInfo.canPay === false && status !== 'cancelled' && (
          <button
            className="btn btn-outline btn-full"
            onClick={() => navigate('/menu', { state: { orderId, addMore: true } })}
            style={{ marginTop: '1rem' }}
          >
            ➕ Agregar más items
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderStatus;

