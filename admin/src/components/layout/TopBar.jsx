import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Search, Bell, User } from 'lucide-react';

const TopBar = () => {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" />
        <input 
          type="text" 
          placeholder="Rechercher..." 
          style={styles.searchInput}
        />
      </div>

      <div style={styles.rightSection}>
        <button style={styles.iconBtn}>
          <Bell size={20} color="#6b7280" />
        </button>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <User size={20} color="#6b7280" />
          </div>
          <span style={styles.userName}>{user?.first_name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '70px',
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: '8px',
    width: '300px',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    marginLeft: '8px',
    width: '100%',
    outline: 'none',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconBtn: {
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '20px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontWeight: '500',
    color: 'var(--text-main)',
  }
};

export default TopBar;
