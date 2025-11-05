import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsSummary, getAnalyticsTrends } from '../../api/api';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

function OwnerAnalytics() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user || (user.role !== 'owner' && user.role !== 'admin'))) {
      navigate('/owner/login');
    } else if (user) {
      loadData();
      
      // Auto-refresh cada 30 segundos
      const interval = setInterval(() => {
        loadData(false);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated, authLoading, navigate, range]);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const [summaryRes, trendsRes] = await Promise.all([
        getAnalyticsSummary(range),
        getAnalyticsTrends(range)
      ]);

      setSummary(summaryRes.data.summary);
      setTrends(trendsRes.data.trends);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error cargando analytics:', error);
      setLoading(false);
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

  const KpiCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600' }}>
          {title}
        </span>
        <Icon size={20} color={color || 'var(--primary)'} />
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/owner/dashboard')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Analytics</h1>
          <button
            className="btn btn-outline"
            onClick={() => loadData()}
            style={{ padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Selector de Rango */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            className={`btn ${range === 'today' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRange('today')}
            style={{ padding: '0.5rem 1rem' }}
          >
            Hoy
          </button>
          <button
            className={`btn ${range === '7d' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRange('7d')}
            style={{ padding: '0.5rem 1rem' }}
          >
            7 días
          </button>
          <button
            className={`btn ${range === '30d' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRange('30d')}
            style={{ padding: '0.5rem 1rem' }}
          >
            30 días
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
          Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
        </p>
      </div>

      {summary && (
        <>
          {/* KPIs Principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <KpiCard
              title="Ventas Totales"
              value={`$${summary.totalSales.toLocaleString('es-CL')}`}
              subtitle={`${summary.totalOrders} órdenes`}
              icon={DollarSign}
              color="var(--success)"
            />
            <KpiCard
              title="Ticket Promedio"
              value={`$${summary.avgTicket.toLocaleString('es-CL')}`}
              subtitle="Por orden"
              icon={ShoppingCart}
              color="var(--accent)"
            />
            <KpiCard
              title="Propinas"
              value={`$${summary.totalTips.toLocaleString('es-CL')}`}
              subtitle={`Promedio: $${summary.avgTip.toLocaleString('es-CL')}`}
              icon={TrendingUp}
              color="var(--warning)"
            />
            <KpiCard
              title="Pagos Digitales"
              value={`${summary.porcentaje_pagos_digitales}%`}
              subtitle="vs POS/Efectivo"
              icon={Clock}
              color="var(--primary)"
            />
          </div>

          {/* Top 5 Items */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              🔥 Top 5 Productos
            </h2>
            {summary.itemsTop5.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-light)' }}>Sin datos</p>
              </div>
            ) : (
              summary.itemsTop5.map((item, index) => (
                <div key={item.itemId} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? 'var(--warning)' : 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                          {item.quantity} unidades vendidas
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                        ${item.revenue.toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tendencias */}
          {trends.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                📈 Tendencias (7d vs 30d)
              </h2>
              {trends.slice(0, 10).map(trend => (
                <div key={trend.itemId} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {trend.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        7 días: {trend.qty7d} | 30 días: {trend.qty30d}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {trend.trending === 'up' ? (
                        <TrendingUp size={20} color="var(--success)" />
                      ) : trend.trending === 'down' ? (
                        <TrendingDown size={20} color="var(--danger)" />
                      ) : null}
                      <span style={{
                        fontWeight: 'bold',
                        color: trend.changePercent > 0 ? 'var(--success)' : trend.changePercent < 0 ? 'var(--danger)' : 'var(--text-light)'
                      }}>
                        {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low Performers */}
          {summary.itemsLow5.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                ⚠️ Baja Rotación
              </h2>
              {summary.itemsLow5.map(item => (
                <div key={item.itemId} className="card" style={{ backgroundColor: '#fff9e6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        Solo {item.quantity} unidades vendidas
                      </div>
                    </div>
                    <AlertCircle size={20} color="var(--warning)" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Métricas Adicionales */}
          <div className="card" style={{ backgroundColor: 'var(--secondary)' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Otras Métricas</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items sin stock:</span>
                <strong>{summary.outOfStockRate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tasa de venta (items vendidos):</span>
                <strong>{summary.sellThroughRate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Órdenes completadas:</span>
                <strong>{summary.totalOrders}</strong>
              </div>
            </div>
          </div>

          {/* Ventas por Hora */}
          {summary.byHour && summary.byHour.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                ⏰ Ventas por Hora
              </h2>
              <div className="card">
                {summary.byHour.map(h => {
                  const maxSales = Math.max(...summary.byHour.map(x => x.sales));
                  const percentage = (h.sales / maxSales) * 100;
                  
                  return (
                    <div key={h.hour} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>{h.hour}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          ${h.sales.toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--secondary)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--accent)',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OwnerAnalytics;

