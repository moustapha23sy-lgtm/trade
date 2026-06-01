import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../hooks';
import api from '../services/api';

const SUCCESS_STYLES = `
  @keyframes petalFall {
    0%   { transform: translateY(-60px) rotate(0deg) scaleX(1); opacity: 1; }
    50%  { transform: translateY(45vh) rotate(360deg) scaleX(-1); opacity: 0.85; }
    100% { transform: translateY(110vh) rotate(720deg) scaleX(1); opacity: 0; }
  }
  @keyframes cardIn {
    0%   { opacity: 0; transform: translateY(50px) scale(0.9); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes checkPop {
    0%   { opacity: 0; transform: scale(0); }
    60%  { transform: scale(1.25); }
    85%  { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
    50%       { box-shadow: 0 0 0 22px rgba(16, 185, 129, 0); }
  }
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .sc-card   { animation: cardIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sc-icon   { animation: checkPop 0.7s cubic-bezier(0.175,0.885,0.32,1.275) 0.35s both, glow 2.2s 1.2s infinite; }
  .sc-t1     { animation: fadeUp 0.55s ease 0.6s both; }
  .sc-t2     { animation: fadeUp 0.55s ease 0.75s both; }
  .sc-t3     { animation: fadeUp 0.55s ease 0.9s both; }
  .sc-btns   { animation: fadeUp 0.55s ease 1.05s both; }
  .btn-shop:hover  { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.13) !important; }
  .btn-wa:hover    { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(37,211,102,0.45) !important; }
`;

const PETAL_COLORS = ['#ff6b6b','#ffa500','#ffd700','#a8e063','#56ccf2','#f06292','#ab47bc','#26c6da','#ff8a65','#66bb6a'];

const SuccessScreen = ({ firstName, lastName, phone }) => {
  const navigate = useNavigate();
  const whatsappMessage = encodeURIComponent(
    `Bonjour Trade Innovation ! 👋\n\nJe viens de passer une commande sur votre site.\nNom complet : ${firstName} ${lastName}\nTéléphone : ${phone}\n\nMerci de confirmer mon expédition.`
  );

  const petals = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 4.2) % 100}%`,
    delay: `${(i * 0.17) % 3}s`,
    duration: `${3.5 + (i % 5) * 0.55}s`,
    size: `${10 + (i % 6) * 3}px`,
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    borderRadius: i % 3 === 0 ? '50% 0 50% 0' : i % 3 === 1 ? '50%' : '30% 70% 70% 30%',
  }));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 45%, #eff6ff 100%)',
      position: 'relative', overflow: 'hidden', padding: '20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{SUCCESS_STYLES}</style>

      {/* Petals */}
      {petals.map(p => (
        <div key={p.id} style={{
          position: 'fixed', top: '-30px', left: p.left, zIndex: 0,
          width: p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.borderRadius,
          animation: `petalFall ${p.duration} ${p.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Card */}
      <div className="sc-card" style={{
        position: 'relative', zIndex: 10,
        maxWidth: '510px', width: '100%',
        background: '#ffffff', borderRadius: '28px',
        padding: '52px 44px 44px', textAlign: 'center',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
      }}>

        {/* Icon */}
        <div className="sc-icon" style={{
          width: '96px', height: '96px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 30px', fontSize: '48px', color: '#fff',
        }}>
          ✓
        </div>

        {/* Title */}
        <h1 className="sc-t1" style={{
          fontSize: '26px', fontWeight: '800', marginBottom: '14px',
          background: 'linear-gradient(135deg, #064e3b, #10b981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Merci {firstName} {lastName} !
        </h1>

        {/* Badge */}
        <div className="sc-t2" style={{ marginBottom: '18px' }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px solid #a7f3d0', borderRadius: '50px',
            padding: '7px 22px', color: '#065f46',
            fontWeight: '700', fontSize: '14px',
          }}>
            🎉 Commande confirmée avec succès
          </span>
        </div>

        <p className="sc-t3" style={{
          color: '#6b7280', fontSize: '15px', lineHeight: '1.75', marginBottom: '32px',
        }}>
          Notre équipe vous contactera très prochainement au{' '}
          <strong style={{
            color: '#111827', background: '#f3f4f6',
            padding: '2px 9px', borderRadius: '6px', fontFamily: 'monospace',
          }}>
            {phone}
          </strong>{' '}
          pour confirmer l'expédition de votre colis. 📦
        </p>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)', marginBottom: '28px' }} />

        {/* Buttons */}
        <div className="sc-btns" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            className="btn-shop"
            onClick={() => navigate('/')}
            style={{
              padding: '15px 28px',
              background: '#f9fafb', color: '#374151',
              border: '1.5px solid #e5e7eb', borderRadius: '14px',
              cursor: 'pointer', fontWeight: '700', fontSize: '15px',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            🛍️ Retour vers la boutique
          </button>

          <a
            className="btn-wa"
            href={`https://wa.me/221776510361?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '15px 28px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#fff', borderRadius: '14px', textDecoration: 'none',
              fontWeight: '700', fontSize: '15px',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 5px 20px rgba(37, 211, 102, 0.35)',
            }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '22px' }}></i>
            Discuter avec nous sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   Main Checkout Component
───────────────────────────────────── */
const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: 'Dakar',
    city: 'Dakar',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await api.post('/promo/validate', { code: promoInput, order_total: cartTotal });
      setAppliedPromo(res.data.promo);
    } catch (error) {
      setPromoError(error.response?.data?.error || 'Code promo invalide');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => { setAppliedPromo(null); setPromoInput(''); setPromoError(''); };

  const finalTotal = appliedPromo ? cartTotal - appliedPromo.discount : cartTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    try {
      if (user) {
        await api.post('/orders', {
          shipping_first_name: formData.firstName,
          shipping_last_name: formData.lastName,
          shipping_email: formData.email,
          shipping_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          payment_method: 'cash',
          promo_code: appliedPromo?.code || null,
          discount_amount: appliedPromo?.discount || 0,
        });
      } else {
        const items = cart.map(item => ({
          product_id: item.product_id || item.product?.id || null,
          name: item.product?.name || 'Produit',
          quantity: item.quantity,
          unit_price: typeof item.product?.price === 'number' ? item.product.price : 0,
        }));
        await api.post('/orders/guest', {
          ...formData, items,
          promo_code: appliedPromo?.code || null,
          discount_amount: appliedPromo?.discount || 0,
        });
      }
      clearCart();
      setSuccess(true);
    } catch (error) {
      console.error('Erreur de commande:', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessScreen
        firstName={formData.firstName}
        lastName={formData.lastName}
        phone={formData.phone}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '30px', fontWeight: '800' }}>Valider la commande</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '30px', alignItems: 'start' }}>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontWeight: '600' }}>Informations de livraison</h2>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Prénom *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={styles.input} placeholder="ex: Moussa" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Nom *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={styles.input} placeholder="ex: Diallo" />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Téléphone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={styles.input} placeholder="+221 77 000 00 00" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Adresse e-mail (Optionnel)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} placeholder="exemple@email.com" />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Adresse de livraison *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required style={styles.input} placeholder="Nom du quartier, rue..." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Ville *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required style={styles.input} />
            </div>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', fontSize: '14px', color: '#166534', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🚚</span>
            <strong>Paiement à la livraison</strong> — Réglez la commande directement auprès du livreur.
          </div>

          <button
            type="submit"
            disabled={cart.length === 0 || loading}
            style={{ ...styles.submitBtn, opacity: (cart.length === 0 || loading) ? 0.7 : 1 }}
          >
            {loading ? 'Traitement en cours...' : 'CONFIRMER MA COMMANDE'}
          </button>
        </form>

        {/* Summary Side */}
        <div>
          {/* Cart Summary */}
          <div style={{ backgroundColor: '#f9fafb', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontWeight: '600' }}>Résumé de la commande</h2>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              {cart.map((item, idx) => {
                const product = item.product || {};
                const price = typeof product.price === 'number' ? product.price : 0;
                return (
                  <li key={item.product_id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
                    <span style={{ color: '#4b5563', fontSize: '14px', flex: 1, paddingRight: '15px' }}>
                      {product.name || 'Produit'} <strong style={{ color: '#111827' }}>x {item.quantity}</strong>
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827', whiteSpace: 'nowrap' }}>
                      {(price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </span>
                  </li>
                );
              })}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', color: '#4b5563' }}>
              <span>Sous-total</span>
              <span style={{ fontWeight: '600' }}>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>

            {appliedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', color: '#10b981' }}>
                <span>Code promo ({appliedPromo.code})</span>
                <span style={{ fontWeight: '600' }}>- {appliedPromo.discount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '2px solid #e5e7eb', fontSize: '22px', fontWeight: '800', color: '#111827' }}>
              <span>Total</span>
              <span>{finalTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {/* Promo Code Block */}
          <div style={{ backgroundColor: '#fff', padding: '24px', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Avez-vous un code promo ?</h3>

            {!appliedPromo ? (
              <div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Entrez votre code"
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    style={{ padding: '0 20px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: (promoLoading || !promoInput.trim()) ? 0.7 : 1, whiteSpace: 'nowrap' }}
                  >
                    {promoLoading ? '...' : 'Appliquer'}
                  </button>
                </div>
                {promoError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '500' }}>{promoError}</p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: '600', fontSize: '14px' }}>
                  <span>🎉</span>
                  Code {appliedPromo.code} appliqué !
                </div>
                <button onClick={removePromo} style={{ background: 'none', border: 'none', color: '#047857', fontSize: '22px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', backgroundColor: '#f9fafb' },
  submitBtn: { width: '100%', padding: '16px', backgroundColor: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.05em' },
};

export default Checkout;
