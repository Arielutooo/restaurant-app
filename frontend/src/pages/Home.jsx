import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ChefHat, Users, BarChart, Lock } from 'lucide-react';

function Home() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🍽️ Restaurant Digital
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
          Sistema completo de pedidos y pagos
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <Link to="/owner/login" className="card" style={{ display: 'block', backgroundColor: 'var(--accent)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Lock size={40} color="white" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Acceso Owner</h3>
              <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                Panel de administración y analytics
              </p>
            </div>
          </div>
        </Link>

        <Link to="/table/1" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <QrCode size={40} color="var(--accent)" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Cliente</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Escanear QR y hacer pedido (Demo Mesa 1)
              </p>
            </div>
          </div>
        </Link>

        <Link to="/waiter" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={40} color="var(--success)" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Panel Garzón</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Aprobar pedidos pendientes
              </p>
            </div>
          </div>
        </Link>

        <Link to="/kitchen" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ChefHat size={40} color="var(--warning)" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Cocina (KDS)</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Gestión de pedidos en cocina
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/qr" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BarChart size={40} color="var(--primary)" />
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Generar QR</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Administrar códigos QR de mesas
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--accent)', color: 'white' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>💡 Modo Demo</h4>
        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Este es un MVP funcional. En producción, los clientes accederían escaneando un QR físico en cada mesa.
        </p>
      </div>
    </div>
  );
}

export default Home;

