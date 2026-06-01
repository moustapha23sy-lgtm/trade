import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Plus, TrendingUp, Zap, X } from 'lucide-react';
import api from '../services/api';

const SECTIONS = [
  {
    key: 'trending',
    label: 'Produits Tendances',
    sublabel: 'Sélection de la semaine · Affiché sur la page d\'accueil',
    icon: <TrendingUp size={22} />,
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  {
    key: 'electro',
    label: 'Notre Gamme Électroménager',
    sublabel: 'Gros & Petit Électroménager · Affiché sur la page d\'accueil',
    icon: <Zap size={22} />,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
];

/* ── Sub-component: one section panel ── */
const SectionPanel = ({ section }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search modal state
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/homepage-sections/${section.key}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [section.key]);

  useEffect(() => { fetchSection(); }, [fetchSection]);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 1) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await api.get(`/homepage-sections/${section.key}/available/search`, { params: { q } });
      setSearchResults(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAdd = async (product) => {
    try {
      await api.post(`/homepage-sections/${section.key}`, {
        product_id: product.id,
        position: products.length,
      });
      setShowModal(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchSection();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout.');
    }
  };

  const handleRemove = async (productId) => {
    if (!window.confirm('Retirer ce produit de la section ?')) return;
    try {
      await api.delete(`/homepage-sections/${section.key}/${productId}`);
      fetchSection();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: '14px',
      border: `1px solid ${section.border}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
      marginBottom: '32px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px',
        background: section.bg,
        borderBottom: `1px solid ${section.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: section.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {section.icon}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>{section.label}</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{section.sublabel}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            background: section.color, color: '#fff',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={17} /> Ajouter un produit
        </button>
      </div>

      {/* Product List */}
      <div style={{ padding: '16px 24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Chargement...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
            <p style={{ margin: 0 }}>Aucun produit dans cette section. Cliquez sur "Ajouter" pour commencer.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', paddingTop: '8px' }}>
            {products.map((p, idx) => (
              <div key={p.id} style={{
                border: '1px solid #e5e7eb', borderRadius: '12px',
                overflow: 'hidden', position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Position badge */}
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: section.color, color: '#fff',
                  fontSize: '12px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                }}>
                  {idx + 1}
                </div>

                {/* Remove btn */}
                <button
                  onClick={() => handleRemove(p.id)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '30px', height: '30px', borderRadius: '8px',
                    border: 'none', background: 'rgba(239,68,68,0.9)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 2,
                  }}
                >
                  <Trash2 size={14} />
                </button>

                {/* Image */}
                <div style={{ height: '130px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '36px' }}>📦</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  {p.category_name && (
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: section.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {p.category_name}
                    </p>
                  )}
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: 1.4 }}>
                    {(p.description || p.name).length > 50 ? (p.description || p.name).slice(0, 50) + '…' : (p.description || p.name)}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                    {Number(p.price).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
          }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Ajouter un produit — <span style={{ color: section.color }}>{section.label}</span>
              </h3>
              <button onClick={() => { setShowModal(false); setSearchQuery(''); setSearchResults([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={22} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '10px 16px' }}>
                <Search size={17} color="#9ca3af" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Rechercher un produit par nom..."
                  autoFocus
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#111827' }}
                />
              </div>
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {searchLoading ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Recherche...</p>
              ) : searchQuery && searchResults.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Aucun produit trouvé.</p>
              ) : !searchQuery ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Tapez un nom de produit pour rechercher.</p>
              ) : (
                searchResults.map(product => (
                  <div key={product.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleAdd(product)}
                  >
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description || product.name}</p>
                      {product.category_name && (
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{product.category_name}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#111827' }}>{Number(product.price).toLocaleString('fr-FR')} FCFA</p>
                      <span style={{ fontSize: '12px', color: section.color, fontWeight: '600' }}>+ Ajouter</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main page ── */
const HomepageSections = () => (
  <div>
    <div style={{ marginBottom: '28px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0 }}>Sections de la page d'accueil</h1>
      <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '14px' }}>
        Choisissez quels produits apparaissent dans chaque section de la page d'accueil du site.
      </p>
    </div>

    {SECTIONS.map(section => (
      <SectionPanel key={section.key} section={section} />
    ))}
  </div>
);

export default HomepageSections;
