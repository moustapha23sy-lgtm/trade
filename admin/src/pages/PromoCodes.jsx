import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ticket, X } from 'lucide-react';
import api from '../services/api';

const PromoCodes = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage', // 'percentage' | 'fixed'
    value: '',
    expires_at: '',
    is_active: true
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/promo');
      // The backend returns { promos: [...] }
      setPromos(res.data.promos || []);
    } catch (error) {
      console.error("Erreur de récupération des promos:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.id);
      let formattedDate = '';
      if (promo.expires_at) {
        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        const date = new Date(promo.expires_at);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      }
      setFormData({
        code: promo.code,
        type: promo.type || 'percentage',
        value: promo.value,
        expires_at: formattedDate,
        is_active: promo.is_active
      });
    } else {
      setEditingId(null);
      setFormData({ code: '', type: 'percentage', value: '', expires_at: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: parseInt(formData.value, 10) || 0,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active
      };

      if (editingId) {
        await api.put(`/promo/${editingId}`, payload);
      } else {
        await api.post('/promo', payload);
      }
      closeModal();
      fetchPromos();
    } catch (error) {
      alert(error.response?.data?.error || "Une erreur est survenue.");
      console.error("Erreur sauvegarde promo:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      try {
        await api.delete(`/promo/${id}`);
        fetchPromos();
      } catch (err) {
        alert("Erreur lors de la suppression");
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Codes Promo</h1>
        <button style={styles.addBtn} onClick={() => openModal()}>
          <Plus size={20} />
          <span>Créer un code</span>
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Chargement...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Valeur</th>
                <th style={styles.th}>Expiration</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <Ticket size={16} color="#3b82f6" />
                      {promo.code}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString()} FCFA`}
                  </td>
                  <td style={styles.td}>
                    {promo.expires_at ? new Date(promo.expires_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'Illimité'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: promo.is_active ? '#d1fae5' : '#fee2e2',
                      color: promo.is_active ? '#10b981' : '#ef4444'
                    }}>
                       {promo.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.actionBtn} onClick={() => openModal(promo)}>
                        <Edit size={18} color="#3b82f6" />
                      </button>
                      <button style={styles.actionBtn} onClick={() => handleDelete(promo.id)}>
                        <Trash2 size={18} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Aucun code promo.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingId ? 'Modifier le code promo' : 'Nouveau code promo'}</h2>
              <button onClick={closeModal} style={styles.closeBtn}><X size={24} color="#6b7280" /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Code Promo</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  style={styles.input} 
                  placeholder="EX: BLACKFRIDAY" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type de réduction</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    style={styles.input}
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (FCFA)</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Valeur</label>
                  <input 
                    type="number" 
                    value={formData.value} 
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    style={styles.input} 
                    placeholder="Ex: 10" 
                    required 
                    min="1"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Est valide jusqu'au (Date et Heure)</label>
                <input 
                  type="datetime-local" 
                  value={formData.expires_at} 
                  onChange={e => setFormData({...formData, expires_at: e.target.value})}
                  style={styles.input} 
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Laissez vide pour un code illimité dans le temps.
                </span>
              </div>
              
              <div style={styles.checkboxGroup}>
                <label style={{...styles.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0}}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                    style={{width: '18px', height: '18px'}} 
                  />
                  Activer immédiatement
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
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
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' },
  addBtn: { backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', border: 'none' },
  card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '16px 24px', verticalAlign: 'middle' },
  actions: { display: 'flex', gap: '12px' },
  actionBtn: { padding: '4px', cursor: 'pointer', background: 'none', border: 'none' },
  
  // MODAL
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  form: { padding: '24px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
  checkboxGroup: { padding: '10px 0 20px 0' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '10px' },
  cancelBtn: { padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontWeight: '500', cursor: 'pointer' },
  saveBtn: { padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', fontWeight: '500', cursor: 'pointer' }
};

export default PromoCodes;
