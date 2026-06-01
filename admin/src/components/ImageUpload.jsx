import React, { useState } from 'react';
import { UploadCloud, X, Loader } from 'lucide-react';
import api from '../services/api';

const ImageUpload = ({ value, onChange, label = "Image du produit" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      // POST to our backend upload route
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update the parent's form state with the resulting URL
      onChange(res.data.url);
    } catch (err) {
      console.error('Erreur Upload:', err);
      setError('Échec du téléchargement. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '10px' }}>
        {label}
      </label>
      
      {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}

      <div style={{ 
        border: '2px dashed var(--border-color)', 
        borderRadius: '8px', 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: value ? '#fff' : '#f9fafb',
        position: 'relative'
      }}>
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
            <Loader className="animate-spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Upload en cours...</span>
          </div>
        ) : value ? (
          <div>
            <button 
              type="button"
              onClick={handleRemove}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '50%',
                width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#e74c3c'
              }}>
              <X size={16} />
            </button>
            <img src={value} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', objectFit: 'contain' }} />
          </div>
        ) : (
          <div>
            <UploadCloud size={32} style={{ margin: '0 auto 12px', color: '#9ca3af' }} />
            <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Glissez-déposez ou cliquez pour ajouter</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            <label 
              htmlFor="image-upload-input" 
              style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              Parcourir les fichiers
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
