import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, Truck, XCircle, Package,
  User, Phone, MapPin, ShoppingBag, FileText, RefreshCw,
  ChevronDown, Save, AlertCircle, CreditCard, Home
} from 'lucide-react';
import api from '../services/api';

/* ─── Status config ─── */
const STATUS_CONFIG = {
  pending:    { label: 'En attente',    color: '#b45309', bg: '#fef9ee', border: '#fde68a', Icon: Clock },
  confirmed:  { label: 'Confirmée',     color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', Icon: CheckCircle },
  processing: { label: 'En traitement', color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc', Icon: RefreshCw },
  shipped:    { label: 'Expédiée',      color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', Icon: Truck },
  delivered:  { label: 'Livrée',        color: '#047857', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle },
  cancelled:  { label: 'Annulée',       color: '#b91c1c', bg: '#fff1f2', border: '#fecdd3', Icon: XCircle },
};

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const ACTIONS = [
  { toStatus: 'confirmed',  label: 'Confirmer la commande',   Icon: CheckCircle, color: '#047857', bg: '#f0fdf4', border: '#bbf7d0' },
  { toStatus: 'processing', label: 'Marquer en traitement',    Icon: RefreshCw,   color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  { toStatus: 'shipped',    label: 'Marquer comme expédiée',   Icon: Truck,       color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { toStatus: 'cancelled',  label: 'Annuler la commande',      Icon: XCircle,     color: '#b91c1c', bg: '#fff1f2', border: '#fecdd3' },
];

/* ─── Helpers ─── */
const getClientName  = o => `${o.first_name || o.shipping_first_name || ''} ${o.last_name || o.shipping_last_name || ''}`.trim() || 'Client invité';
const getClientEmail = o => o.email || o.shipping_email || '—';
const getClientPhone = o => o.user_phone || o.shipping_phone || '—';
const getInitials    = o => {
  const n = getClientName(o);
  return n === 'Client invité' ? '?' : n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

/* ─── StatusBadge ─── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', Icon: AlertCircle };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      <cfg.Icon size={13} /> {cfg.label}
    </span>
  );
}

/* ─── Main Component ─── */
export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);
  const [note,       setNote]       = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved,  setNoteSaved]  = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        const ord = res.data.order;
        setOrder(ord);
        setNote(ord.notes || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (!order || updating) return;
    setUpdating(true);
    setStatusOpen(false);
    try {
      const res = await api.put(`/orders/${order.id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: res.data.order.status }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async () => {
    setNoteSaving(true);
    try {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } finally {
      setNoteSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#9ca3af', gap: 12 }}>
      <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite' }} /> Chargement…
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
      <AlertCircle size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
      <div>Commande introuvable.</div>
    </div>
  );

  const statusIdx  = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const cfg         = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 1060, margin: '0 auto' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={() => navigate('/orders')} style={s.backBtn}>
          <ArrowLeft size={15} /> Retour
        </button>
        <span style={{ color: '#d1d5db', fontSize: 14 }}>/</span>
        <span style={{ color: '#6b7280', fontSize: 14 }}>Commandes</span>
        <span style={{ color: '#d1d5db', fontSize: 14 }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Commande #{order.id}</span>
      </div>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Commande #{order.id}</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* Status dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setStatusOpen(o => !o)}
            disabled={updating}
            style={{ ...s.dropBtn, opacity: updating ? 0.6 : 1 }}
          >
            <StatusBadge status={order.status} />
            <ChevronDown size={15} style={{ color: '#9ca3af', transition: 'transform .2s', transform: statusOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {statusOpen && (
            <div style={s.dropMenu}>
              {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                <button key={key} onClick={() => updateStatus(key)} style={{
                  ...s.dropItem,
                  background: key === order.status ? c.bg : 'transparent',
                  color: key === order.status ? c.color : '#374151',
                  fontWeight: key === order.status ? 700 : 400,
                }}>
                  <c.Icon size={13} style={{ color: c.color }} /> {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ═══ LEFT ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Card: Infos commande */}
          <div style={s.card}>
            <div style={s.cardTitle}>Infos commande</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InfoTile icon={<ShoppingBag size={14} />} label="Référence" value={`#${order.id}`} accent />
              <InfoTile icon={<Clock size={14} />} label="Date" value={new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} />
              <InfoTile icon={<CreditCard size={14} />} label="Paiement" value={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fef9ee', color: '#b45309', border: '1px solid #fde68a' }}>
                  <Clock size={11} /> {order.payment_method === 'cash' ? 'À la livraison' : order.payment_method}
                </span>} />
              <InfoTile icon={<Home size={14} />} label="Livraison" value={`Domicile — ${order.shipping_city || 'N/A'}`} />
            </div>
          </div>

          {/* Card: Client */}
          <div style={s.card}>
            <div style={s.cardTitle}>Client</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
              <div style={s.avatar}>{getInitials(order)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{getClientName(order)}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{getClientEmail(order)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <ClientRow icon={<Phone size={13} />}  label="Téléphone"        value={getClientPhone(order)} />
              <ClientRow icon={<MapPin size={13} />} label="Adresse livraison" value={[order.shipping_address, order.shipping_city].filter(Boolean).join(', ') || '—'} />
            </div>
          </div>

          {/* Card: Articles */}
          <div style={s.card}>
            <div style={s.cardTitle}>Articles commandés</div>

            {order.items && order.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={s.itemRow}>
                    <div style={s.itemThumb}>
                      {item.product_image
                        ? <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        : <Package size={20} style={{ color: '#d1d5db' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{item.product_name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Qté : {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', whiteSpace: 'nowrap' }}>
                      {Number(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#d1d5db', fontSize: 13, padding: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} /> Aucun article trouvé.
              </div>
            )}

            {/* Totals */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
              <TRow label="Sous-total" value={`${Number((order.total_amount || 0) + (order.discount_amount || 0)).toLocaleString('fr-FR')} FCFA`} />
              <TRow label="Livraison"  value="0 FCFA" />
              {order.discount_amount > 0 && (
                <TRow label={`Réduction (${order.promo_code || 'code promo'})`} value={`- ${Number(order.discount_amount).toLocaleString('fr-FR')} FCFA`} green />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '2px solid #f3f4f6' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>{Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Card: Actions */}
          <div style={s.card}>
            <div style={s.cardTitle}>Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ACTIONS.map(({ toStatus, label, Icon, color, bg, border }) => {
                const isActive = order.status === toStatus;
                return (
                  <button
                    key={toStatus}
                    disabled={isActive || updating || isCancelled}
                    onClick={() => updateStatus(toStatus)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 9,
                      border: `1px solid ${isActive ? border : '#e5e7eb'}`,
                      background: isActive ? bg : '#fff',
                      color: isActive ? color : '#6b7280',
                      fontSize: 13, fontWeight: 600,
                      cursor: (isActive || isCancelled) ? 'default' : 'pointer',
                      transition: 'all 0.18s',
                      opacity: (updating || (isCancelled && toStatus !== 'cancelled')) ? 0.4 : 1,
                      textAlign: 'left',
                      boxShadow: isActive ? `0 0 0 3px ${border}` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isActive && !isCancelled) {
                        e.currentTarget.style.background = bg;
                        e.currentTarget.style.color = color;
                        e.currentTarget.style.borderColor = border;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive && !isCancelled) {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#6b7280';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    {isActive ? <CheckCircle size={15} style={{ color }} /> : <Icon size={15} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Historique */}
          <div style={s.card}>
            <div style={s.cardTitle}>Historique du statut</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STATUS_FLOW.map((st, i) => {
                const c    = STATUS_CONFIG[st];
                const done = !isCancelled && statusIdx >= i;
                const isCur = order.status === st;
                return (
                  <div key={st} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative', paddingBottom: i < STATUS_FLOW.length - 1 ? 18 : 0 }}>
                    {i < STATUS_FLOW.length - 1 && (
                      <div style={{ position: 'absolute', left: 7, top: 18, width: 2, bottom: 0, background: done ? '#10b981' : '#e5e7eb', borderRadius: 2 }} />
                    )}
                    <div style={{
                      width: 16, height: 16, minWidth: 16, borderRadius: '50%', marginTop: 2, zIndex: 1,
                      background: done ? (isCur ? c.color : '#10b981') : '#fff',
                      border: `2px solid ${done ? (isCur ? c.color : '#10b981') : '#d1d5db'}`,
                      boxShadow: isCur ? `0 0 0 4px ${c.bg}` : 'none',
                      transition: 'all 0.3s',
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isCur ? 700 : 500, color: done ? '#111827' : '#9ca3af' }}>{c.label}</div>
                      {isCur && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {new Date(order.updated_at || order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {new Date(order.updated_at || order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isCancelled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '10px 12px', borderRadius: 9, background: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <XCircle size={15} style={{ color: '#b91c1c' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>Commande annulée</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Note interne */}
          <div style={s.card}>
            <div style={s.cardTitle}>Note interne</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ajouter une note visible uniquement par les admins..."
              style={{
                width: '100%', minHeight: 90, padding: '10px 12px',
                border: '1.5px solid #e5e7eb', borderRadius: 9,
                fontSize: 13, fontFamily: "'Inter', sans-serif",
                color: '#374151', background: '#f9fafb',
                resize: 'vertical', outline: 'none', lineHeight: 1.6,
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
            />
            <button
              onClick={saveNote}
              disabled={noteSaving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                width: '100%', marginTop: 10, padding: '10px 0',
                borderRadius: 9, border: 'none',
                background: noteSaved ? '#10b981' : '#2563eb',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.25s ease',
                boxShadow: noteSaved ? '0 2px 8px rgba(16,185,129,0.25)' : '0 2px 8px rgba(37,99,235,0.2)',
              }}
            >
              {noteSaved ? <><CheckCircle size={15} /> Note enregistrée</> : <><Save size={15} /> Enregistrer la note</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */
function InfoTile({ icon, label, value, accent }) {
  return (
    <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        <span style={{ color: '#d1d5db' }}>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ? '#2563eb' : '#111827' }}>{value}</div>
    </div>
  );
}

function ClientRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#9ca3af' }}>
        <span style={{ color: '#d1d5db' }}>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', maxWidth: 180, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

function TRow({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: '#6b7280' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: green ? '#047857' : '#374151' }}>{value}</span>
    </div>
  );
}

/* ─── Styles ─── */
const s = {
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    border: '1px solid #e5e7eb', background: '#fff',
    color: '#6b7280', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.18s',
  },
  card: {
    background: '#fff', borderRadius: 14,
    padding: '20px 22px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 16,
  },
  avatar: {
    width: 46, height: 46, minWidth: 46, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d28d9, #2563eb)',
    color: '#fff', fontWeight: 800, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(109,40,217,0.25)',
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 14px', background: '#f9fafb',
    borderRadius: 10, border: '1px solid #f3f4f6',
  },
  itemThumb: {
    width: 50, height: 50, minWidth: 50, borderRadius: 9,
    background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  dropBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px 7px 7px', borderRadius: 10,
    border: '1px solid #e5e7eb', background: '#fff',
    cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  dropMenu: {
    position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 100,
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)', padding: 6, minWidth: 210,
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
    padding: '9px 14px', borderRadius: 8, border: 'none',
    fontSize: 13, cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
  },
};
