import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, Clock, CheckCircle, Truck, XCircle, Search,
  ChevronLeft, ChevronRight, Package, RefreshCw, AlertCircle, Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/* ─── Status config ─── */
const STATUS_CONFIG = {
  pending:    { color: '#b45309', bg: '#fef3c7', label: 'En attente',  Icon: Clock },
  confirmed:  { color: '#1d4ed8', bg: '#dbeafe', label: 'Confirmée',   Icon: CheckCircle },
  processing: { color: '#0891b2', bg: '#cffafe', label: 'En traitement', Icon: RefreshCw },
  shipped:    { color: '#6d28d9', bg: '#ede9fe', label: 'Expédiée',    Icon: Truck },
  delivered:  { color: '#047857', bg: '#d1fae5', label: 'Livrée',      Icon: CheckCircle },
  cancelled:  { color: '#b91c1c', bg: '#fee2e2', label: 'Annulée',     Icon: XCircle },
};

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function StatusBadge({ status, style = {} }) {
  const cfg = STATUS_CONFIG[status] || { color: '#6b7280', bg: '#f3f4f6', label: status, Icon: AlertCircle };
  const { Icon } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 9999,
      fontSize: 12, fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
      ...style,
    }}>
      <Icon size={13} /> {cfg.label}
    </span>
  );
}

/* ─── Main component ─── */
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [statusCounts, setStatusCounts] = useState({});
  const [pagination, setPagination]     = useState({ page: 1, pages: 1, total: 0 });

  /* ─── Fetch list ─── */
  const fetchOrders = useCallback(async (page = 1, status = activeStatus) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (status !== 'all') params.status = status;
      const res = await api.get('/orders/all', { params });
      const data = res.data;
      setOrders(data.orders || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Erreur commandes:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  /* ─── Fetch counts per status ─── */
  const fetchCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        STATUS_ORDER.map(s => api.get('/orders/all', { params: { status: s, limit: 1 } }))
      );
      const counts = {};
      results.forEach((r, i) => { counts[STATUS_ORDER[i]] = r.data.pagination?.total || 0; });
      setStatusCounts(counts);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchOrders(1, activeStatus);
    fetchCounts();
  }, [activeStatus]);

  /* ─── Open order detail ─── */
  const openDetail = (order) => {
    navigate(`/orders/${order.id}`);
  };

  /* ─── Client display name ─── */
  const getClientName = (o) => {
    const fn = o.first_name || o.shipping_first_name || '';
    const ln = o.last_name  || o.shipping_last_name  || '';
    return `${fn} ${ln}`.trim() || 'Client invité';
  };

  const getClientEmail = (o) => o.email || o.shipping_email || '—';
  const getClientInitials = (o) => {
    const name = getClientName(o);
    return name === 'Client invité' ? '?' : name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  /* ─── Client-side search ─── */
  const filtered = orders.filter(o => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      `#${o.id}`.includes(q) ||
      getClientName(o).toLowerCase().includes(q) ||
      getClientEmail(o).toLowerCase().includes(q)
    );
  });

  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Commandes</h1>
          <p style={s.subtitle}>{pagination.total} commande{pagination.total !== 1 ? 's' : ''} au total</p>
        </div>
        <button style={s.refreshBtn} onClick={() => { fetchOrders(pagination.page, activeStatus); fetchCounts(); }}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {/* ── Status Tabs ── */}
      <div style={s.tabs}>
        {[{ key: 'all', label: 'Toutes', count: totalAll }, ...STATUS_ORDER.map(k => ({
          key: k, label: STATUS_CONFIG[k].label, count: statusCounts[k] || 0
        }))].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveStatus(tab.key); }}
            style={{
              ...s.tab,
              ...(activeStatus === tab.key ? s.tabActive : {}),
            }}
          >
            {tab.label}
            <span style={{
              ...s.tabCount,
              ...(activeStatus === tab.key ? s.tabCountActive : {}),
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Card ── */}
      <div style={s.card}>

        {/* Search bar */}
        <div style={s.cardHeader}>
          <div style={s.searchWrap}>
            <Search size={17} style={{ color: '#9ca3af', position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher par n°, client, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={s.searchInput}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.emptyState}>
            <RefreshCw size={28} style={{ opacity: 0.3, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <Package size={36} style={{ opacity: 0.15, marginBottom: 12 }} />
            Aucune commande trouvée.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Commande', 'Date', 'Client', 'Articles', 'Total', 'Code Promo', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    style={s.tr}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ ...s.td, fontWeight: 700, color: '#1e293b' }}>#{order.id}</td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={s.avatar}>{getClientInitials(order)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{getClientName(order)}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{getClientEmail(order)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>
                      {order.item_count || '—'} article{order.item_count > 1 ? 's' : ''}
                    </td>
                    <td style={{ ...s.td, fontWeight: 700, color: '#1e293b' }}>
                      <div>{Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</div>
                      {order.discount_amount > 0 && (
                        <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
                          -{Number(order.discount_amount).toLocaleString('fr-FR')} FCFA
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      {order.promo_code ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 9999,
                          fontSize: 12, fontWeight: 700,
                          backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe'
                        }}>
                          <Ticket size={12} /> {order.promo_code}
                        </span>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.eyeBtn}
                        title="Voir les détails"
                        onClick={() => openDetail(order)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div style={s.pagination}>
            <button
              style={s.pageBtn}
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                style={{ ...s.pageBtn, ...(p === pagination.page ? s.pageBtnActive : {}) }}
                onClick={() => fetchOrders(p)}
              >
                {p}
              </button>
            ))}
            <button
              style={s.pageBtn}
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 3 },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0',
    background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },

  /* Tabs */
  tabs: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 16px', borderRadius: 8, border: '1.5px solid transparent',
    background: 'transparent', color: '#64748b', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  tabActive: {
    background: '#fff', color: '#1e293b', fontWeight: 700,
    border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  tabCount: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: '#f1f5f9', color: '#94a3b8', minWidth: 22,
  },
  tabCountActive: { background: '#2563eb', color: '#fff' },

  /* Card */
  card: {
    background: '#fff', borderRadius: 14,
    boxShadow: '0 4px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center',
  },
  searchWrap: { position: 'relative', width: '100%', maxWidth: 380 },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 40px',
    border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14,
    outline: 'none', background: '#f8fafc', fontFamily: 'inherit',
    transition: 'all 0.2s',
  },

  /* Table */
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '13px 20px',
    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
    color: '#94a3b8', fontWeight: 700, background: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
  },
  tr: { transition: 'background-color 0.15s' },
  td: { padding: '15px 20px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' },
  avatar: {
    width: 38, height: 38, minWidth: 38, borderRadius: '50%',
    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    color: '#4338ca', fontWeight: 800, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  eyeBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 9, border: 'none',
    background: '#eff6ff', color: '#2563eb', cursor: 'pointer',
    transition: 'all 0.18s ease',
  },

  /* Pagination */
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '16px 20px', borderTop: '1px solid #f1f5f9',
  },
  pageBtn: {
    minWidth: 36, height: 36, borderRadius: 8,
    border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  pageBtnActive: { background: '#2563eb', color: '#fff', border: '1.5px solid #2563eb' },

  /* Empty */
  emptyState: {
    padding: '60px 20px', textAlign: 'center', color: '#94a3b8',
    display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 14,
  },

};

export default Orders;
