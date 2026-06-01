import React, { useEffect, useState } from 'react';
import { Users, ShoppingCart, Package, TrendingUp, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_CFG = {
  pending:    { label: 'En attente',  color: '#b45309', bg: '#fef9ee' },
  confirmed:  { label: 'Confirmée',   color: '#1d4ed8', bg: '#eff6ff' },
  processing: { label: 'En trait.',   color: '#0e7490', bg: '#ecfeff' },
  shipped:    { label: 'Expédiée',    color: '#6d28d9', bg: '#f5f3ff' },
  delivered:  { label: 'Livrée',      color: '#047857', bg: '#f0fdf4' },
  cancelled:  { label: 'Annulée',     color: '#b91c1c', bg: '#fff1f2' },
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: '#9ca3af', fontSize: 15 }}>
      Chargement…
    </div>
  );
  if (!stats) return <div style={{ color: '#ef4444', padding: 20 }}>Erreur de chargement.</div>;

  const { stats: s, recent_orders = [], top_products = [], status_breakdown = [] } = stats;

  const kpis = [
    { label: "Chiffre d'affaires", value: `${(s.total_revenue || 0).toLocaleString('fr-FR')} FCFA`, sub: `${(s.monthly_revenue || 0).toLocaleString('fr-FR')} ce mois`, color: '#2563eb', bg: '#dbeafe', Icon: TrendingUp },
    { label: 'Commandes',          value: s.total_orders,   sub: `${s.pending_orders} en attente`,      color: '#047857', bg: '#d1fae5', Icon: ShoppingCart },
    { label: 'Clients',            value: s.total_customers, sub: 'comptes enregistrés',               color: '#b45309', bg: '#fef3c7', Icon: Users },
    { label: 'Rupture de stock',   value: s.out_of_stock,   sub: `${s.low_stock} en stock faible`,     color: '#b91c1c', bg: '#fee2e2', Icon: Package },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Tableau de bord</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Bienvenue dans votre espace administration.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpis.map(({ label, value, sub, color, bg, Icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
                <h3 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</h3>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{sub}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Recent orders */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={sectionTitle}>Commandes récentes</div>
            <button onClick={() => navigate('/orders')} style={linkBtn}>Voir tout →</button>
          </div>
          {recent_orders.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune commande récente.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Client', 'Montant', 'Statut', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_orders.map(o => {
                  const cfg = STATUS_CFG[o.status] || STATUS_CFG.pending;
                  const name = [o.first_name, o.last_name].filter(Boolean).join(' ') || 'Invité';
                  return (
                    <tr key={o.id}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      style={{ transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '11px 12px', fontWeight: 700, color: '#111827', fontSize: 13 }}>#{o.id}</td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151' }}>{name}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 700, fontSize: 13, color: '#111827' }}>{Number(o.total_amount || 0).toLocaleString('fr-FR')} FCFA</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <button onClick={() => navigate(`/orders/${o.id}`)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center' }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Statuts */}
          <div style={card}>
            <div style={{ ...sectionTitle, marginBottom: 16 }}>Commandes par statut</div>
            {status_breakdown.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune donnée.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {status_breakdown.map(({ status, count }) => {
                  const cfg = STATUS_CFG[status] || { label: status, color: '#6b7280', bg: '#f9fafb' };
                  const total = status_breakdown.reduce((a, b) => a + parseInt(b.count), 0);
                  const pct = total ? Math.round(parseInt(count) / total * 100) : 0;
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                        <span style={{ color: '#9ca3af' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top products */}
          <div style={card}>
            <div style={{ ...sectionTitle, marginBottom: 16 }}>Top produits (30j)</div>
            {top_products.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Aucune vente ce mois.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {top_products.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '50%', background: i === 0 ? '#fef3c7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i === 0 ? '#b45309' : '#6b7280' }}>
                      {i + 1}
                    </div>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '1px solid #f3f4f6' }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} style={{ color: '#d1d5db' }} /></div>
                    }
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.total_sold} vendus</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                      {Number(p.total_revenue || 0).toLocaleString('fr-FR')} F
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const card = { background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const sectionTitle = { fontSize: 13, fontWeight: 700, color: '#111827' };
const linkBtn = { background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 };

export default Dashboard;
