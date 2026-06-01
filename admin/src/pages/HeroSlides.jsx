import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, X, Save } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const HeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '', title_highlight: '', subtitle: '', cta_text: 'Acheter', cta_link: '#', tag: '', sort_order: 0, image_url: '', is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/slides/all');
      setSlides(res.data.slides || res.data.all || res.data);
    } catch (error) {
      console.error("Erreur de récupération des slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce slide ?")) {
      try {
        await api.delete(`/slides/${id}`);
        fetchSlides();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleOpenModal = (s = null) => {
    if (s) {
      setEditingSlide(s);
      setFormData({
        title: s.title || '', title_highlight: s.title_highlight || '', subtitle: s.subtitle || '',
        cta_text: s.cta_text || '', cta_link: s.cta_link || '', tag: s.tag || '',
        sort_order: s.sort_order || 0, image_url: s.image_url || '', is_active: s.is_active !== false
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '', title_highlight: '', subtitle: '', cta_text: 'Acheter maintenant', cta_link: '#',
        tag: 'Nouveau', sort_order: 0, image_url: '', is_active: true
      });
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingSlide(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSlide) {
        await api.put(`/slides/${editingSlide.id}`, formData);
      } else {
        await api.post('/slides', formData);
      }
      handleClose();
      fetchSlides();
    } catch (err) {
      console.error("Erreur d'enregistrement:", err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hero Slides (Carrousel)</h1>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          <span>Ajouter un slide</span>
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>Chargement...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Titre complet</th>
                <th style={styles.th}>Sous-titre</th>
                <th style={styles.th}>Bouton</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => (
                <tr key={slide.id} style={styles.tr}>
                  <td style={styles.td}>
                    {slide.image_url ? (
                      <div style={{...styles.logoImage, backgroundImage: `url(${slide.image_url})`}} />
                    ) : (
                      <div style={{...styles.logoImage, backgroundColor: '#f3f4f6'}}><ImageIcon size={18} color="#9ca3af"/></div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>{slide.tag || '---'}</span>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>
                        {slide.title} <span style={{color: 'var(--primary-color)'}}>{slide.title_highlight}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{...styles.td, color: '#4b5563', fontSize: 13}}>{slide.subtitle || '-'}</td>
                  <td style={{...styles.td, fontSize: 13}}><strong style={{color: '#374151'}}>{slide.cta_text}</strong> <br/><span style={{fontSize: 11, color: '#9ca3af'}}>{slide.cta_link}</span></td>
                  <td style={styles.td}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: slide.is_active ? '#d1fae5' : '#f3f4f6', color: slide.is_active ? '#047857' : '#6b7280' }}>
                      {slide.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.editBtn} onClick={() => handleOpenModal(slide)}>
                        <Edit size={16} />
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(slide.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {slides.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Aucun slide trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={handleClose}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#111827', fontWeight: 700 }}>
                {editingSlide ? 'Modifier le slide' : 'Nouveau slide'}
              </h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="#9ca3af" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Image *</label>
                <ImageUpload value={formData.image_url} onChange={url => setFormData({...formData, image_url: url})} />
                <p style={{fontSize: 11, color: '#6b7280', margin: 0, marginTop: 4}}>Image de fond ou illustration du slide (résolution idéale: 1920x800px).</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Titre principal *</label>
                  <input required style={styles.input} type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Découvrez notre collection" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Titre en surbrillance (Optionnel)</label>
                  <input style={styles.input} type="text" value={formData.title_highlight} onChange={e => setFormData({...formData, title_highlight: e.target.value})} placeholder="Ex: d'Hiver" />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Sous-titre / Description Courte</label>
                <input style={styles.input} type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Texte du bouton</label>
                  <input style={styles.input} type="text" value={formData.cta_text} onChange={e => setFormData({...formData, cta_text: e.target.value})} />
                </div>
                <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Lien du bouton</label>
                  <input style={styles.input} type="text" value={formData.cta_link} onChange={e => setFormData({...formData, cta_link: e.target.value})} placeholder="Ex: /shop?category=electromenager" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Badge (Tag)</label>
                  <input style={styles.input} type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Ex: Nouveauté" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ordre d'affichage</label>
                  <input style={styles.input} type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
                </div>
                <div style={{...styles.formGroup, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24}}>
                  <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{width: 16, height: 16}} />
                  <label htmlFor="isActive" style={{fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer'}}>Slide Actif</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                <button type="button" onClick={handleClose} style={{ padding: '10px 16px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer le slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' },
  title: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 },
  addBtn: { backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 24px', fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.15s' },
  td: { padding: '16px 24px', verticalAlign: 'middle' },
  logoImage: { width: '80px', height: '45px', borderRadius: '6px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actions: { display: 'flex', gap: '8px' },
  editBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' },
  deleteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalContent: { background: '#fff', padding: '24px 32px', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: '#fff' }
};

export default HeroSlides;
