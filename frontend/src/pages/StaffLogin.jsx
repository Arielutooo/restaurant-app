import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ChefHat, UserCheck } from 'lucide-react';

function StaffLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Detectar si viene de /kitchen o /waiter
  const from = location.state?.from || '/';
  const isKitchen = from.includes('kitchen');
  const isWaiter = from.includes('waiter');
  
  const [email, setEmail] = useState(isKitchen ? 'kitchen@restaurant.com' : isWaiter ? 'waiter@restaurant.com' : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirigir a donde venía
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isKitchen) return 'Acceso Cocina';
    if (isWaiter) return 'Acceso Garzón';
    return 'Acceso Staff';
  };

  const getIcon = () => {
    if (isKitchen) return <ChefHat size={48} color="var(--primary)" />;
    if (isWaiter) return <UserCheck size={48} color="var(--primary)" />;
    return <LogIn size={48} color="var(--primary)" />;
  };

  return (
    <div className="container" style={{ 
      paddingTop: '3rem', 
      maxWidth: '450px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {getIcon()}
        <h1 style={{ 
          fontSize: '2rem', 
          marginTop: '1rem',
          marginBottom: '0.5rem' 
        }}>
          {getTitle()}
        </h1>
        <p style={{ color: 'var(--text-light)' }}>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@restaurant.com"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fee',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: 'var(--danger)',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ fontSize: '1.1rem', padding: '1rem' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }}></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Ayuda para desarrollo */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--secondary)',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            💡 Credenciales de prueba:
          </p>
          <p style={{ color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            <strong>Cocina:</strong> kitchen@restaurant.com
          </p>
          <p style={{ color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            <strong>Garzón:</strong> waiter@restaurant.com
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            <strong>Contraseña:</strong> admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;

