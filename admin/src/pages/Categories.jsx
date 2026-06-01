import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, X, Save } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', parent_id: '', image_url: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.all || res.data.categories || res.data);
    } catch (error) {
      console.error("Erreur de récupération des catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ 
        name: cat.name, 
        slug: cat.slug || '', 
        description: cat.description || '',
        parent_id: cat.parent_id || '',
        image_url: cat.image_url || ''
      });
    } else {
      setEditingCat(null);
      setFormData({ name: '', slug: '', description: '', parent_id: '', image_url: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      alert("Erreur lors de l'enregistrement de la catégorie.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette catégorie ? Cela peut affecter les produits liés.")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Catégories</h1>
        <button style={styles.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          <span>Créer une catégorie</span>
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Chargement...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.filter(c => c.parent_id !== null).map((cat) => (
                <tr key={cat.id} style={styles.tr}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={styles.td}>
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #f3f4f6', display: 'block' }}
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    ) : null}
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, background: '#f3f4f6',
                      display: cat.image_url ? 'none' : 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FolderTree size={18} color="#d1d5db" />
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#111827' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: '#9ca3af', fontSize: 13 }}>{cat.slug}</td>
                  <td style={{ ...styles.td, color: '#6b7280', fontSize: 13 }}>{cat.description || '—'}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.editBtn} onClick={() => handleOpenModal(cat)}
                        onMouseEnter={e => { e.currentTarget.style.background='#2563eb'; e.currentTarget.style.color='#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#2563eb'; }}>
                        <Edit size={16} />
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(cat.id)}
                        onMouseEnter={e => { e.currentTarget.style.background='#ef4444'; e.currentTarget.style.color='#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#ef4444'; }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.filter(c => c.parent_id !== null).length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>Aucune catégorie trouvée.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
                {editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom de la Catégorie (ex: Climatiseurs)</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  style={styles.input} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Slug (Optionnel)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  style={styles.input} 
                  placeholder="Laissez vide pour auto-générer"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pôle de rattachement (ex: Électroménager)</label>
                <select 
                  value={formData.parent_id} 
                  onChange={e => setFormData({...formData, parent_id: e.target.value})} 
                  style={styles.input}
                  required
                >
                  <option value="">Sélectionnez un Pôle</option>
                  {categories.filter(c => c.parent_id === null).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>Choisissez le Pôle principal auquel appartient cette catégorie.</p>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{...styles.input, minHeight: '80px', resize: 'vertical'}} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Miniature</label>
                <ImageUpload 
                  value={formData.image_url} 
                  onChange={(url) => setFormData({...formData, image_url: url})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={handleCloseModal} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>
                  <Save size={16} /> Enregistrer
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  addBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '600',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid var(--border-color)',
  },
  tr: { borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' },
  td: { padding: '14px 20px', verticalAlign: 'middle' },
  actions: { display: 'flex', gap: 8 },
  editBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: 'none', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', transition: 'all 0.18s' },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', transition: 'all 0.18s' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: '8px',
    width: '100%', maxWidth: '600px', padding: '24px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px'
  },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '8px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' },
  cancelBtn: { padding: '8px 16px', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: '500', border: 'none', cursor: 'pointer' },
  saveBtn: { padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--primary-color)', color: '#fff', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
};

export default Categories;
