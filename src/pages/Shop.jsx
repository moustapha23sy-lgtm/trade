import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Shop = ({ showToast }) => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = categoryParam ? `/products?category=${categoryParam}` : '/products';
        const res = await api.get(url);
        // Ensure to handle our custom pagination wrapper
        setProducts(res.data.products || res.data);
      } catch (error) {
        console.error("Erreur boutique:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam]);

  // Reveal animation for products when they load
  useEffect(() => {
    if (!loading && products.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });

      const elements = document.querySelectorAll('.reveal');
      elements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [loading, products]);

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '28px', color: '#002855', marginBottom: '30px', textTransform: 'capitalize' }}>
        {categoryParam ? categoryParam.replace(/-/g, ' ') : 'Boutique'}
      </h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Chargement des produits...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
          <i className="fas fa-box-open" style={{ fontSize: '40px', color: '#ccc', marginBottom: '16px', display: 'block' }}></i>
          <p style={{ fontSize: '16px' }}>Aucun produit trouvé dans cette catégorie.</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Revenez bientôt, nous enrichissons notre catalogue régulièrement !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                originalPrice: product.original_price,
                image: product.primary_image || product.image_url,
                badge: product.badge,
                category: product.category_name || 'Produit'
              }} 
              onAddToCart={() => {
                addToCart(product, 1);
                if (showToast) showToast(`${product.name} ajouté au panier ✓`);
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
