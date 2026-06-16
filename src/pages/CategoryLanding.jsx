import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CategoryLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/categories/${slug}`);
        setCategory(res.data.category);
      } catch (err) {
        console.error('Erreur chargement catégorie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (!category) return <div style={styles.loading}>Catégorie introuvable.</div>;

  const children = category.children || [];
  const hasChildren = children.length > 0;
  const isPole = category.parent_id == null;
  // Afficher la grille de catégories dès qu'il y a des enfants
  const showCategoriesGrid = hasChildren;

  // Détermine où naviguer selon si l'enfant a lui-même des sous-catégories
  const handleChildClick = (sub) => {
    const subHasChildren =
      parseInt(sub.child_count) > 0 || (sub.children && sub.children.length > 0);
    if (subHasChildren) {
      navigate(`/category/${sub.slug}`);
    } else {
      navigate(`/shop?category=${sub.slug}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.breadcrumb}>
            <Link to="/" style={styles.breadLink}>Accueil</Link>
            {(category.ancestors || []).map((ancestor) => (
              <span key={ancestor.id}>
                {' / '}
                <Link to={`/category/${ancestor.slug}`} style={styles.breadLink}>
                  {ancestor.name}
                </Link>
              </span>
            ))}
            {' / '}
            <span>{category.name}</span>
          </p>
          <h1 style={styles.heroTitle}>{category.name}</h1>
          {category.description && <p style={styles.heroDesc}>{category.description}</p>}
        </div>
      </div>

      <div style={styles.container}>
        {showCategoriesGrid ? (
          <>
            <h2 style={styles.sectionTitle}>Choisissez une catégorie</h2>
            <div style={styles.grid}>
              {children.map((sub) => {
                const subHasChildren =
                  parseInt(sub.child_count) > 0 || (sub.children && sub.children.length > 0);
                return (
                  <div
                    key={sub.id}
                    style={styles.card}
                    onClick={() => handleChildClick(sub)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                      e.currentTarget.style.borderColor = '#e25c00';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = '#eee';
                    }}
                  >
                    {sub.image_url ? (
                      <img src={sub.image_url} alt={sub.name} style={styles.cardImg} />
                    ) : (
                      <div style={styles.cardImgPlaceholder}>
                        <i
                          className={subHasChildren ? 'fas fa-folder-open' : 'fas fa-tag'}
                          style={{ fontSize: '28px', color: '#e25c00' }}
                        ></i>
                      </div>
                    )}
                    <div style={styles.cardBody}>
                      <h3 style={styles.cardTitle}>{sub.name}</h3>
                      {subHasChildren ? (
                        <span style={styles.cardCount}>
                          {sub.child_count} sous-catégorie{parseInt(sub.child_count) > 1 ? 's' : ''}
                        </span>
                      ) : (
                        sub.product_count > 0 && (
                          <span style={styles.cardCount}>
                            {sub.product_count} produit{sub.product_count > 1 ? 's' : ''}
                          </span>
                        )
                      )}
                      <div style={styles.cardArrow}>
                        {subHasChildren ? 'Voir les sous-catégories' : 'Voir les produits'}
                        <i className="fas fa-arrow-right" style={{ marginLeft: '6px', fontSize: '12px' }}></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Découvrez tous nos produits dans cette catégorie.
            </p>
            <button
              onClick={() => navigate(`/shop?category=${category.slug}`)}
              style={styles.shopBtn}
            >
              Voir les produits
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { fontFamily: "'Inter', sans-serif", minHeight: '60vh' },
  loading: { textAlign: 'center', padding: '100px', color: '#666', fontFamily: "'Inter', sans-serif" },
  hero: { background: 'linear-gradient(135deg, #002855 0%, #003f85 100%)', padding: '50px 20px', color: '#fff' },
  heroInner: { maxWidth: '1200px', margin: '0 auto' },
  breadcrumb: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' },
  breadLink: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none' },
  heroTitle: { fontSize: '36px', fontWeight: '700', margin: '0 0 10px 0', color: '#fff' },
  heroDesc: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: '600px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '50px 20px' },
  sectionTitle: { fontSize: '22px', fontWeight: '600', color: '#002855', marginBottom: '30px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #eee',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardImg: { width: '100%', height: '160px', objectFit: 'cover' },
  cardImgPlaceholder: {
    width: '100%', height: '160px', backgroundColor: '#fff8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: '18px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#002855', margin: '0 0 6px 0' },
  cardCount: { fontSize: '12px', color: '#888', display: 'block', marginBottom: '12px' },
  cardArrow: { fontSize: '13px', color: '#e25c00', fontWeight: '600', display: 'flex', alignItems: 'center' },
  shopBtn: {
    padding: '14px 32px', backgroundColor: '#002855', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
  },
};

export default CategoryLanding;
