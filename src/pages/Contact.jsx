import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../services/api'; // we assume this is the client api instance or we can just fetch

const Contact = ({ showToast }) => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch store settings for contact info
    api.get('/settings')
      .then(res => setSettings(res.data.settings))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      setFormData({ name: '', email: '', subject: '', message: '' });
      if (showToast) showToast("Message envoyé avec succès ! Nous vous recontacterons vite.");
      else alert("Message envoyé avec succès !");
    } catch (err) {
      console.error('Erreur envoi contact:', err);
      if (showToast) showToast('Erreur lors de l\'envoi du message.');
      else alert('Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Contactez-nous</h1>
          <p style={styles.subtitle}>Nous sommes là pour répondre à toutes vos questions</p>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.grid}>
          {/* Info Column */}
          <div style={styles.infoCol}>
            <h2 style={styles.sectionTitle}>Nos coordonneés</h2>
            <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
              Besoin d'aide ou d'informations supplémentaires sur nos produits ? N'hésitez pas à nous contacter via le formulaire ou directement.
            </p>

            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <div style={styles.iconWrapper}><MapPin style={styles.icon} /></div>
                <div>
                  <h4 style={styles.itemTitle}>Adresse</h4>
                  <p style={styles.itemText}>{settings?.contact_address || 'Adresse non renseignée'}</p>
                </div>
              </div>
              <div style={styles.contactItem}>
                <div style={styles.iconWrapper}><Phone style={styles.icon} /></div>
                <div>
                  <h4 style={styles.itemTitle}>Téléphone</h4>
                  <p style={styles.itemText}>{settings?.contact_phone || 'Non renseigné'}</p>
                </div>
              </div>
              <div style={styles.contactItem}>
                <div style={styles.iconWrapper}><Mail style={styles.icon} /></div>
                <div>
                  <h4 style={styles.itemTitle}>Email</h4>
                  <p style={styles.itemText}>{settings?.contact_email || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Real Map Link */}
            <a href="https://maps.app.goo.gl/otDXxghbjHx1wMxd7" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div style={styles.mapContainer}>
                <div style={styles.mapPlaceholder}>
                  <MapPin size={40} color="#2563eb" style={{ marginBottom: 16 }} />
                  <span style={{ color: '#111827', fontWeight: 600, fontSize: 16 }}>Ouvrir dans Google Maps</span>
                  <span style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Cliquez pour voir l'itinéraire</span>
                </div>
              </div>
            </a>
          </div>

          {/* Form Column */}
          <div style={styles.formCol}>
            <h2 style={{...styles.sectionTitle, marginBottom: 24}}>Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Votre nom</label>
                <input 
                  type="text" 
                  required 
                  style={styles.input} 
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Votre email</label>
                <input 
                  type="email" 
                  required 
                  style={styles.input} 
                  placeholder="jean@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Sujet</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  placeholder="Question sur un produit"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Message</label>
                <textarea 
                  required 
                  style={{ ...styles.input, minHeight: 150, resize: 'vertical' }} 
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Envoi en cours...' : (
                  <>Envoyer le message <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { backgroundColor: '#fff', padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' },
  headerContent: { maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 40, fontWeight: 800, color: '#111827', margin: '0 0 16px 0', letterSpacing: '-0.02em' },
  subtitle: { fontSize: 18, color: '#6b7280', margin: 0 },
  content: { maxWidth: 1100, margin: '0 auto', padding: '60px 20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' },
  
  // Info col
  infoCol: { display: 'flex', flexDirection: 'column' },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 16 },
  contactList: { display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 },
  contactItem: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  iconWrapper: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { color: 'var(--primary-color)', width: 24 },
  itemTitle: { fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' },
  itemText: { fontSize: 16, fontWeight: 500, color: '#111827', margin: 0 },
  mapContainer: { width: '100%', height: 250, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  mapPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  
  // Form col
  formCol: { backgroundColor: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: '#374151' },
  input: { padding: '14px 16px', borderRadius: 8, border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: 15, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'var(--orange)', color: '#fff', border: 'none', padding: '16px', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: 10 }
};

export default Contact;
