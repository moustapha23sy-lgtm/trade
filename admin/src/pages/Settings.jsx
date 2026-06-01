import React, { useState, useEffect } from 'react';
import { Save, UserCog, Settings as SettingsIcon, Share2, Plus, Edit, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import ImageUpload from '../components/ImageUpload';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  
  // Shop API state
  const [settings, setSettings] = useState({
    store_name: '', logo_url: '', currency: 'FCFA', language: 'fr',
    contact_email: '', contact_phone: '', contact_address: '',
    social_facebook: '', social_instagram: '', social_twitter: ''
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  // Custom Socials state for UI
  const availableSocials = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'];
  const [selectedSocial, setSelectedSocial] = useState('Facebook');
  const [socialLink, setSocialLink] = useState('');

  // Users API state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'customer' });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoadingConfig(true);
      const res = await api.get('/settings');
      if (res.data.settings) {
        setSettings(s => ({ ...s, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Erreur config:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if(e) e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('Paramètres enregistrés avec succès.');
    } catch (err) {
      console.error('Erreur save:', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocial = () => {
    if (!socialLink) return;
    const key = `social_${selectedSocial.toLowerCase()}`;
    setSettings(prev => ({...prev, [key]: socialLink}));
    setSocialLink('');
  };

  const handleRemoveSocial = (key) => {
    setSettings(prev => ({...prev, [key]: ''}));
  };

  // User Actions
  const handleOpenUserModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setUserForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', role: u.role });
    } else {
      setEditingUser(null);
      setUserForm({ first_name: '', last_name: '', email: '', password: '', role: 'customer' });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', userForm);
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.response?.data?.error || 'Erreur sauvegarde.');
    }
  };

  const tabs = [
    { id: 'shop', label: 'Boutique', icon: SettingsIcon },
    { id: 'social', label: 'Réseaux & Contacts', icon: Share2 },
    { id: 'users', label: 'Utilisateurs & Rôles', icon: UserCog }
  ];

  if (loadingConfig) return <div style={styles.loading}>Chargement des paramètres...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Paramètres</h1>
      
      <div style={styles.tabsContainer}>
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabBtn, 
              borderBottom: activeTab === t.id ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--primary-color)' : '#6b7280'
            }}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {activeTab === 'shop' && (
          <form onSubmit={handleSaveSettings}>
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Logo de la boutique</label>
                <ImageUpload 
                  value={settings.logo_url} 
                  onChange={(url) => setSettings({...settings, logo_url: url})} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom de la boutique</label>
                  <input style={styles.input} type="text" value={settings.store_name || ''} onChange={e => setSettings({...settings, store_name: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Devise</label>
                  <select style={styles.input} value={settings.currency || 'FCFA'} onChange={e => setSettings({...settings, currency: e.target.value})}>
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Langue par défaut</label>
                  <select style={styles.input} value={settings.language || 'fr'} onChange={e => setSettings({...settings, language: e.target.value})}>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={styles.actions}>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'social' && (
          <form onSubmit={handleSaveSettings}>
            <div style={styles.grid}>
              {/* Coordonnées */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#111827' }}>Coordonnées de contact</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email public</label>
                  <input style={styles.input} type="email" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Téléphone</label>
                  <input style={styles.input} type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Adresse physique</label>
                  <textarea style={{...styles.input, resize: 'vertical', minHeight: 80}} value={settings.contact_address || ''} onChange={e => setSettings({...settings, contact_address: e.target.value})} />
                </div>
              </div>
              
              {/* Réseaux sociaux */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#111827' }}>Liens réseaux sociaux</h3>
                
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <select style={{...styles.input, marginBottom: 8}} value={selectedSocial} onChange={e => setSelectedSocial(e.target.value)}>
                      {availableSocials.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input style={styles.input} type="url" placeholder="URL du profil..." value={socialLink} onChange={e => setSocialLink(e.target.value)} />
                  </div>
                  <button type="button" onClick={handleAddSocial} style={{...styles.saveBtn, padding: '10px 16px', background: '#3b82f6'}}>Ajouter</button>
                </div>
                
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {availableSocials.map(s => {
                    const key = `social_${s.toLowerCase()}`;
                    const val = settings[key];
                    if (!val) return null;
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <div>
                          <strong style={{ fontSize: 13, color: '#374151' }}>{s}</strong>
                          <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{val}</div>
                        </div>
                        <button type="button" onClick={() => handleRemoveSocial(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div style={styles.actions}>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => handleOpenUserModal()} style={styles.saveBtn}>
                <Plus size={18} /> Ajouter un utilisateur
              </button>
            </div>
            {loadingUsers ? (
              <div style={styles.loading}>Chargement...</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nom complet</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Inscrit le</th>
                    <th style={styles.th}>Rôle</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{fontWeight: 600, color: '#111827'}}>{u.first_name} {u.last_name}</div>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: u.role === 'admin' ? '#eff6ff' : '#f3f4f6', 
                          color: u.role === 'admin' ? '#1d4ed8' : '#374151'
                        }}>{u.role}</span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleOpenUserModal(u)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}>
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: 20}}>Aucun utilisateur</td></tr>}
                </tbody>
              </table>
            )}
            
            {showUserModal && (
              <div style={styles.modalOverlay}>
                 <div style={styles.modalContent}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h2>
                     <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6b7280" /></button>
                   </div>
                   <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Prénom</label>
                          <input required style={styles.input} type="text" value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Nom</label>
                          <input required style={styles.input} type="text" value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})} />
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input required style={styles.input} type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Mot de passe {editingUser && '(Laisser vide pour ne pas modifier)'}</label>
                        <input minLength={6} required={!editingUser} style={styles.input} type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Rôle</label>
                        <select style={styles.input} value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} disabled={user?.id === editingUser?.id}>
                          <option value="customer">Client</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                        <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '10px 16px', background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                        <button type="submit" style={styles.saveBtn}>Enregistrer</button>
                      </div>
                   </form>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Inter', sans-serif" },
  title: { fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 24px 0' },
  loading: { padding: 40, textAlign: 'center', color: '#6b7280' },
  tabsContainer: { display: 'flex', gap: 24, borderBottom: '1px solid #e5e7eb', marginBottom: 24 },
  tabBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 4px', background: 'none', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', fontSize: 14, fontFamily: 'inherit', transition: 'border-color 0.2s', backgroundColor: '#fff' },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6' },
  saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 24px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '16px', fontSize: 14, color: '#4b5563' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
};

export default Settings;
