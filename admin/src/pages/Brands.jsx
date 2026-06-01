import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X, Save } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      setBrands(res.data.brands || res.data.all || res.data);
    } catch (error) {
      console.error('Erreur marques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, logo_url: brand.logo_url || '' });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', logo_url: '' });
    }
    setShowModal(true);
  };

  const handleClose = () => { setShowModal(false); setEditingBrand(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, formData);
      } else {
        await api.post('/brands', formData);
      }
      handleClose();
      fetchBrands();
    } catch (err) {
      console.error('Erreur save brand:', err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette marque ?')) {
      try {
        await api.delete(`/brands/${id}`);
        fetchBrands();
      } catch (err) {
        console.error('Erreur suppression:', err);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={st.header}>
        <h1 style={st.title}>Marques</h1>
        <button style={st.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Ajouter une marque
        </button>
      </div>

      {/* Table */}
      <div style={st.card}>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
        ) : (
          <table style={st.table}>
            <thead>
              <tr>
                <th style={st.th}>Logo</th>
                <th style={st.th}>Nom</th>
                <th style={st.th}>Slug</th>
                <th style={st.th}>Produits</th>
                <th style={st.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand.id} style={st.tr}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={st.td}>
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, border: '1px solid #f3f4f6', background: '#fff', padding: 4 }}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, background: '#f3f4f6',
                      display: brand.logo_url ? 'none' : 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Tag size={18} color="#d1d5db" />
                    </div>
                  </td>
                  <td style={{ ...st.td, fontWeight: 600, color: '#111827' }}>{brand.name}</td>
                  <td style={{ ...st.td, color: '#9ca3af', fontSize: 13 }}>{brand.slug}</td>
                  <td style={{ ...st.td, color: '#6b7280', fontSize: 13 }}>
                    {brand.product_count || 0} produit{brand.product_count !== 1 ? 's' : ''}
                  </td>
                  <td style={st.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={st.editBtn} onClick={() => handleOpenModal(brand)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}>
                        <Edit size={16} />
                      </button>
                      <button style={st.deleteBtn} onClick={() => handleDelete(brand.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>Aucune marque trouvée.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={st.overlay} onClick={handleClose}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <div style={st.modalHead}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {editingBrand ? 'Modifier la marque' : 'Nouvelle marque'}
              </h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#9ca3af" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={st.formGroup}>
                <label style={st.label}>Nom de la marque *</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={st.input}
                  placeholder="Ex: Samsung, LG, Hisense..."
                />
              </div>
              <div style={st.formGroup}>
                <label style={st.label}>Logo</label>
                <ImageUpload
                  value={formData.logo_url}
                  onChange={url => setFormData({ ...formData, logo_url: url })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" onClick={handleClose} style={st.cancelBtn}>Annuler</button>
                <button type="submit" disabled={saving} style={st.saveBtn}>
                  <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const st = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-main)' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 9,
    backgroundColor: 'var(--primary-color)', color: '#fff',
    fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
  },
  card: { backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #e5e7eb' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '13px 20px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', fontWeight: 700, backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' },
  tr: { borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s' },
  td: { padding: '14px 20px', verticalAlign: 'middle' },
  editBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: 'none', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', transition: 'all 0.18s' },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', transition: 'all 0.18s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, padding: '28px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  formGroup: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  cancelBtn: { padding: '9px 18px', borderRadius: 8, background: '#f3f4f6', color: '#6b7280', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, background: 'var(--primary-color)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 6px rgba(37,99,235,0.25)' },
};

export default Brands;
