import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Image as ImageIcon,
  Settings,
  LogOut,
  FolderTree,
  Ticket,
  LayoutPanelTop
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Produits', path: '/products', icon: <Package size={20} /> },
    { name: 'Catégories', path: '/categories', icon: <FolderTree size={20} /> },
    { name: 'Marques', path: '/brands', icon: <Tag size={20} /> },
    { name: 'Commandes', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Codes Promo', path: '/promos', icon: <Ticket size={20} /> },
    { name: 'Slides (Carrousel)', path: '/slides', icon: <ImageIcon size={20} /> },
    { name: 'Page d\'accueil', path: '/homepage-sections', icon: <LayoutPanelTop size={20} /> },
    { name: 'Paramètres', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logo}>🛒 Trade Admin</div>
      </div>
      
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            {item.icon}
            <span style={styles.navText}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <button style={styles.logoutBtn} onClick={logout}>
          <LogOut size={20} />
          <span style={styles.navText}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--sidebar-bg)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  },
  logoContainer: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    color: '#9ca3af',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    borderLeft: '4px solid #fff',
  },
  navText: {
    marginLeft: '12px',
    fontWeight: '500',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    color: '#ef4444',
    width: '100%',
    padding: '8px 4px',
    borderRadius: '4px',
    transition: 'background 0.2s',
  }
};

export default Sidebar;
