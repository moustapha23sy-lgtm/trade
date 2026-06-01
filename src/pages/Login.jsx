import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/account');
      } else {
        await register({ email, password, first_name: firstName });
        navigate('/account');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'authentification');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#002855' }}>
        {isLogin ? 'Connexion' : 'Créer un compte'}
      </h2>

      {error && <div style={{ color: '#d9534f', backgroundColor: '#f9f2f2', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Prénom *</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Identifiant ou adresse e-mail *</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Mot de passe *</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button type="submit" style={{ backgroundColor: '#002855', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLogin ? 'Connexion' : 'S\'enregistrer'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Créer un nouveau compte' : 'Déjà un compte ? Connectez-vous'}
        </button>
      </div>
    </div>
  );
};

export default Login;
