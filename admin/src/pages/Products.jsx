import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/admin');
      // The API currently returns { products: [], totalPages: x, currentPage: y } for pagination
      setProducts(res.data.products || res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Produits</h1>
        <button style={styles.addBtn} onClick={() => navigate('/products/new')}>
          <Plus size={20} />
          <span>Ajouter un produit</span>
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou UGS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          {/* FIlters could go here */}
        </div>

        {loading ? (
          <div style={{padding: '20px', textAlign: 'center'}}>Chargement des produits...</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Nom du produit</th>
                  <th style={styles.th}>UGS</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Prix</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      {product.primary_image || product.image_url ? (
                        <div style={{...styles.productImage, backgroundImage: `url(${product.primary_image || product.image_url})`}} />
                      ) : (
                        <div style={{...styles.productImage, backgroundColor: '#e5e7eb'}} />
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productCategory}>{product.category_name || 'Non catégorisé'}</div>
                    </td>
                    <td style={styles.td}>{product.sku || '-'}</td>
                    <td style={styles.td}>
                      <span style={{color: product.stock_quantity > 10 ? 'var(--success)' : 'var(--danger)', fontWeight: '500'}}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td style={styles.td}>{product.price.toLocaleString()} FCFA</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge, 
                        backgroundColor: product.is_published ? '#d1fae5' : '#f3f4f6',
                        color: product.is_published ? '#059669' : '#4b5563'
                      }}>
                        {product.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button style={styles.actionBtn} onClick={() => navigate(`/products/edit/${product.id}`)} title="Modifier">
                          <Edit size={18} color="#3b82f6" />
                        </button>
                        <button style={styles.actionBtn} onClick={() => handleDelete(product.id)} title="Supprimer">
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Aucun produit trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  addBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  toolbar: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '8px 12px',
    width: '300px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    marginLeft: '8px',
    width: '100%',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '600',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid var(--border-color)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  productImage: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  productName: {
    fontWeight: '500',
    color: 'var(--text-main)',
    marginBottom: '4px',
  },
  productCategory: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  actionBtn: {
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  }
};

export default Products;
