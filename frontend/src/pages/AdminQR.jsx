import React, { useState } from 'react';
import { generateQR } from '../api/api';
import { Download, QrCode } from 'lucide-react';

function AdminQR() {
  const [tableNumber, setTableNumber] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!tableNumber) {
      alert('Ingresa un número de mesa');
      return;
    }

    setLoading(true);
    try {
      const response = await generateQR(tableNumber);
      setQrCode(response.data);
      setLoading(false);
    } catch (err) {
      alert('Error generando QR: ' + err.message);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `mesa-${tableNumber}-qr.png`;
    link.href = qrCode.qrCode;
    link.click();
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        🔐 Generador de códigos QR
      </h1>

      <form onSubmit={handleGenerate} className="card">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Número de mesa
        </label>
        <input
          type="number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Ej: 1, 2, 3..."
          min="1"
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        />

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }}></div>
              Generando...
            </>
          ) : (
            <>
              <QrCode size={20} />
              Generar QR
            </>
          )}
        </button>
      </form>

      {qrCode && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            QR Mesa {qrCode.tableNumber}
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <img 
              src={qrCode.qrCode} 
              alt={`QR Mesa ${qrCode.tableNumber}`}
              style={{ width: '250px', height: '250px' }}
            />
          </div>

          <button
            className="btn btn-accent btn-full"
            onClick={handleDownload}
          >
            <Download size={20} />
            Descargar QR
          </button>

          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--secondary)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
              💡 Imprime este QR y colócalo en la mesa {qrCode.tableNumber}. 
              Los clientes podrán escanearlo para acceder al menú digital.
            </p>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--accent)', color: 'white' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>📱 Instrucciones</h4>
        <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          <li>Genera un código QR para cada mesa</li>
          <li>Descarga e imprime el código</li>
          <li>Coloca el QR en un lugar visible de la mesa</li>
          <li>Los clientes escanearán el QR con su celular</li>
          <li>Accederán automáticamente al menú digital</li>
        </ol>
      </div>
    </div>
  );
}

export default AdminQR;

