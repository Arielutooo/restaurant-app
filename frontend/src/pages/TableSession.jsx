import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { generateQR, createSessionFromQR } from '../api/api';

function TableSession() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { createSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Generar QR (en producción esto estaría preimpreso)
        const qrResponse = await generateQR(tableNumber);
        const { token } = qrResponse.data;

        // Crear sesión desde QR
        const sessionResponse = await createSessionFromQR(token, parseInt(tableNumber));
        const sessionData = sessionResponse.data.session;

        createSession(sessionData);
        
        // Redirigir al menú
        setTimeout(() => {
          navigate('/menu');
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initSession();
  }, [tableNumber]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
        <h3 style={{ marginTop: '1rem' }}>Iniciando sesión</h3>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          Mesa {tableNumber}
        </p>
      </div>
    </div>
  );
}

export default TableSession;

