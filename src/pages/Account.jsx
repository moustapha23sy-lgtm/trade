import React, { useState } from 'react';
import { useAuth } from '../hooks';
import '../styles/App.css'; // Adjust based on styling needs

const tabs = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'orders', label: 'Commandes' },
  { id: 'downloads', label: 'Téléchargements' },
  { id: 'addresses', label: 'Adresses' },
  { id: 'account_details', label: 'Détails du compte' },
  { id: 'compare', label: 'Compare' },
  { id: 'wishlist', label: 'Wishlist' }
];

const Account = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('downloads'); // Default to match screenshot

  if (!user) {
    return (
      <div className="account-container" style={{ padding: '60px 20px', minHeight: '60vh', textAlign: 'center' }}>
        <h2>Veuillez vous connecter pour accéder à votre compte.</h2>
        <a href="/login" style={{ color: '#0056b3', textDecoration: 'underline' }}>Aller à la page de connexion</a>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <p>Bonjour <strong>{user.first_name}</strong> (pas {user.first_name}? <button onClick={logout} style={{background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0}}>Déconnexion</button>)</p>
            <p>À partir du tableau de bord de votre compte, vous pouvez visualiser vos commandes récentes, gérer vos adresses de livraison et de facturation, ainsi que changer votre mot de passe et les détails de votre compte.</p>
          </div>
        );
      case 'orders':
        return (
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '4px' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Aucune commande n'a été passée pour le moment.
              <a href="/shop" style={{ backgroundColor: '#002855', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>Parcourir les produits</a>
            </p>
          </div>
        );
      case 'downloads':
        return (
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '4px' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
              Aucun téléchargement actuellement disponible.
              <a href="/shop" style={{ backgroundColor: '#002855', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>Parcourir les produits</a>
            </p>
          </div>
        );
      case 'addresses':
        return <p>Les adresses suivantes seront utilisées par défaut sur la page de validation de commande.</p>;
      case 'account_details':
        return (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Prénom *</label>
                <input type="text" defaultValue={user.first_name} style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nom *</label>
                <input type="text" defaultValue={user.last_name || ''} style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Adresse e-mail *</label>
              <input type="email" defaultValue={user.email} style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#002855', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>Enregistrer les modifications</button>
          </form>
        );
      case 'compare':
        return <p>Vous n'avez aucun produit à comparer.</p>;
      case 'wishlist':
        return <p>Votre liste de souhaits est vide.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="account-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', gap: '40px' }}>
        
        {/* Sidebar Nav */}
        <div style={{ flex: '0 0 250px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderRight: '1px solid #eee' }}>
            {tabs.map(tab => (
              <li key={tab.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeTab === tab.id ? '#0056b3' : '#333',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={logout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 15px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#333',
                }}
              >
                Se déconnecter
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default Account;
