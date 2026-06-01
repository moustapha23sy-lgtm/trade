import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Search } from 'lucide-react';
import api from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      // On filtre pour ne garder que les rôles customer
      const clients = (res.data.users || []).filter(u => u.role === 'customer');
      setCustomers(clients);
    } catch (err) {
      console.error('Erreur récup clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Clients</h1>
        <div style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{padding: 40, textAlign: 'center', color: '#6b7280'}}>Chargement...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                        {c.first_name?.[0]}{c.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{c.first_name} {c.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 13 }}>
                        <Mail size={14} color="#9ca3af" /> {c.email}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 13 }}>
                      <Calendar size={14} color="#9ca3af" /> {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: 20 },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: 14, width: 250 },
  card: { backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 24px', fontSize: 12, textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.15s' },
  td: { padding: '16px 24px', verticalAlign: 'middle' }
};

export default Customers;
