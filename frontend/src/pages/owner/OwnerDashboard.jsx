import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Menu as MenuIcon, LogOut, Settings, TrendingUp } from 'lucide-react';

function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || (user.role !== 'owner' && user.role !== 'admin'))) {
      navigate('/owner/login');
    }
  }, [user, isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/owner/login');
  };

  if (loading || !user) {
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
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Panel de Control
          </h1>
          <p style={{ color: 'var(--text-light)' }}>
            Bienvenido, {user.name}
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={handleLogout}
          style={{ padding: '0.5rem 1rem' }}
        >
          <LogOut size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <Link to="/owner/analytics" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={32} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Analytics</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Métricas de ventas, tendencias y KPIs
              </p>
            </div>
          </div>
        </Link>

        <Link to="/owner/menu" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MenuIcon size={32} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Gestión de Menú</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Crear, editar y administrar items del menú
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/qr" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={32} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Generar QR</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Códigos QR para mesas
              </p>
            </div>
          </div>
        </Link>

        <Link to="/" className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              backgroundColor: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={32} color="white" />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Ver Sistema Cliente</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Vista de cliente, cocina y garzón
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--secondary)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          👤 Rol: <strong>{user.role === 'owner' ? 'Propietario' : 'Administrador'}</strong>
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
          📧 {user.email}
        </p>
      </div>
    </div>
  );
}

export default OwnerDashboard;

