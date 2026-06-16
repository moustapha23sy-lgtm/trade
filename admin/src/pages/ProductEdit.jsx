import React, { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { buildTree, getLeafCategories, getCategoryPath } from '../utils/categories';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    brand_id: '',
    sku: '',
    stock_quantity: 10,
    stock_status: 'in_stock',
    badge: '',
    image_url: '',
    is_published: true,
  });

  useEffect(() => {
    fetchOptions();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(catRes.data.all || catRes.data.categories || catRes.data || []);
      setBrands(brandRes.data.brands || brandRes.data.all || brandRes.data || []);
    } catch (error) {
      console.error("Erreur récupération options:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/admin/${id}`);
      const data = res.data;
      if (data.images && Array.isArray(data.images)) {
        data.images = data.images.map(img => img.image_url);
      } else {
         data.images = [];
      }
      if (data.image_url && data.images.length === 0) {
         data.images = [data.image_url];
      }
      setFormData(data);
    } catch (error) {
      console.error("Erreur récupération produit:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/products');
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const categoryTree = buildTree(categories);
  const leafCategories = getLeafCategories(categories);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>{id ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
        <div style={styles.headerActions}>
          <button style={styles.cancelBtn} onClick={() => navigate('/products')}>
            <X size={18} /> Annuler
          </button>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
            <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {/* Left Column */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Informations générales</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom du produit</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} style={{...styles.input, minHeight: '150px'}} />
            </div>
          </div>

          <div style={{...styles.card, display: 'flex', gap: '20px'}}>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Prix (FCFA)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Prix avant promo (barré)</label>
              <input type="number" name="original_price" value={formData.original_price || ''} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={{...styles.card, display: 'flex', gap: '20px'}}>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>UGS (SKU)</label>
              <input type="text" name="sku" value={formData.sku || ''} onChange={handleChange} style={styles.input} />
            </div>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Quantité en stock</label>
              <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} style={styles.input} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Statut et Visibilité</h2>
            <div style={styles.formGroupCheckbox}>
              <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} id="is_pub" />
              <label htmlFor="is_pub" style={{fontWeight: '500'}}>Publier ce produit</label>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>État du stock</label>
              <select name="stock_status" value={formData.stock_status} onChange={handleChange} style={styles.input}>
                <option value="in_stock">En stock</option>
                <option value="out_of_stock">Rupture de stock</option>
                <option value="on_backorder">Sur commande</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Badge dynamique</label>
              <input type="text" name="badge" value={formData.badge || ''} onChange={handleChange} placeholder="Ex: Nouveau, Promo..." style={styles.input} />
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Organisation</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Catégorie</label>
              <select name="category_id" value={formData.category_id || ''} onChange={handleChange} style={styles.input} required>
                <option value="">Sélectionner une catégorie</option>
                {categoryTree.map((pole) => (
                  <optgroup key={pole.id} label={pole.name}>
                    {leafCategories
                      .filter((leaf) => {
                        let current = leaf;
                        while (current?.parent_id) {
                          if (current.parent_id === pole.id) return true;
                          current = categories.find((c) => c.id === current.parent_id);
                        }
                        return false;
                      })
                      .map((leaf) => (
                        <option key={leaf.id} value={leaf.id}>
                          {getCategoryPath(leaf, categories).replace(`${pole.name} › `, '')}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Marque</label>
              <select name="brand_id" value={formData.brand_id || ''} onChange={handleChange} style={styles.input}>
                <option value="">Sélectionner une marque</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Images du Produit</h2>
            {(formData.images || []).map((url, index) => (
              <ImageUpload 
                key={index}
                label={`Image ${index + 1}`}
                value={url} 
                onChange={(newUrl) => {
                  const newArray = [...(formData.images || [])];
                  if (newUrl) {
                    newArray[index] = newUrl;
                  } else {
                    newArray.splice(index, 1);
                  }
                  setFormData({...formData, images: newArray});
                }} 
              />
            ))}
            <ImageUpload 
              label={`Ajouter une image ${(formData.images?.length || 0) + 1}`}
              value=""
              onChange={(newUrl) => {
                if (newUrl) {
                  setFormData({...formData, images: [...(formData.images || []), newUrl]});
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' },
  headerActions: { display: 'flex', gap: '12px' },
  cancelBtn: { backgroundColor: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontWeight: '500' },
  saveBtn: { backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontWeight: '500' },
  container: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' },
  formGroup: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  formGroupCheckbox: { marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', width: '100%' }
};

export default ProductEdit;
