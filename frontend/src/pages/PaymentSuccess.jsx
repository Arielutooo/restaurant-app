import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentId } = location.state || {};

  return (
    <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem 1.5rem' }}>
        <CheckCircle size={80} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--success)' }}>
          ¡Pago exitoso!
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
          Tu pedido ha sido confirmado y pagado
        </p>

        {orderId && (
          <div style={{ 
            backgroundColor: 'var(--secondary)', 
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
              Código de orden
            </p>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              fontFamily: 'monospace',
              color: 'var(--primary)'
            }}>
              {orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div style={{ 
          backgroundColor: 'var(--success)', 
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '0.95rem' }}>
            ✅ Tu pedido se está preparando en cocina
          </p>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={() => navigate('/')}
        >
          <Home size={20} />
          Volver al inicio
        </button>
      </div>

      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--accent)', color: 'white' }}>
        <p style={{ fontSize: '0.9rem' }}>
          🙏 ¡Gracias por tu compra!
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;

