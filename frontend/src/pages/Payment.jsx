import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPayment, confirmPayment } from '../api/api';
import { CreditCard, Smartphone } from 'lucide-react';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId]);

  const tipOptions = [
    { label: '10%', value: 0.10 },
    { label: '15%', value: 0.15 },
    { label: '20%', value: 0.20 }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setLoading(true);
    try {
      // Calcular propina
      const tipAmount = customTip ? parseFloat(customTip) : 0;

      // Crear pago
      const response = await createPayment({
        orderId,
        method: selectedMethod,
        tip: tipAmount
      });

      const { payment, paymentData } = response.data;

      // Simular confirmación de pago (en producción iría a la pasarela)
      if (selectedMethod === 'webpay') {
        // Redirigir a WebPay (simulado)
        setTimeout(async () => {
          await confirmPayment(payment._id, paymentData.token);
          navigate('/payment/success', { state: { orderId, paymentId: payment._id } });
        }, 2000);
      } else {
        // Para Apple/Google Pay, simular confirmación exitosa
        setTimeout(async () => {
          await confirmPayment(payment._id);
          navigate('/payment/success', { state: { orderId, paymentId: payment._id } });
        }, 2000);
      }
    } catch (err) {
      alert('Error al procesar el pago: ' + err.message);
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'applepay', name: 'Apple Pay', icon: '🍎' },
    { id: 'googlepay', name: 'Google Pay', icon: '🅖' },
    { id: 'webpay', name: 'WebPay', icon: '💳' }
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '8rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Método de pago
      </h1>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          Selecciona tu método
        </h3>

        {paymentMethods.map(method => (
          <div
            key={method.id}
            className="card"
            onClick={() => setSelectedMethod(method.id)}
            style={{
              cursor: 'pointer',
              border: selectedMethod === method.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              backgroundColor: selectedMethod === method.id ? 'var(--secondary)' : 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{method.icon}</span>
              <div style={{ flex: 1 }}>
                <h4>{method.name}</h4>
              </div>
              {selectedMethod === method.id && (
                <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          Propina (opcional)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {tipOptions.map(option => (
            <button
              key={option.value}
              className={`btn ${tip === option.value ? 'btn-accent' : 'btn-outline'}`}
              onClick={() => {
                setTip(option.value);
                setCustomTip('');
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Otro monto (CLP)"
          value={customTip}
          onChange={(e) => {
            setCustomTip(e.target.value);
            setTip(0);
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div className="card" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
          💡 Modo Demo
        </p>
        <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
          Los pagos se simularán exitosamente. En producción se integrarían con pasarelas reales.
        </p>
      </div>

      <button
        className="btn btn-success btn-full"
        onClick={handlePayment}
        disabled={loading || !selectedMethod}
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
        {loading ? (
          <>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }}></div>
            Procesando pago...
          </>
        ) : (
          `Pagar ahora`
        )}
      </button>
    </div>
  );
}

export default Payment;

