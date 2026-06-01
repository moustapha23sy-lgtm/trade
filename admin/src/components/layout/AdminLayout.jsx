import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useAuth from '../../hooks/useAuth';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.mainWrapper}>
        <TopBar />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainWrapper: {
    flex: 1,
    marginLeft: '260px', // width of sidebar
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '30px',
    backgroundColor: 'var(--bg-main)',
    overflowY: 'auto'
  }
};

export default AdminLayout;
