import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Activity, CheckCircle, Truck, Lock } from 'lucide-react';
import { useCart } from '../hooks';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductDetail = ({ showToast }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // We rely on the /api/products/:slug endpoint which returns the full graph
        const res = await api.get(`/products/${slug}`);
        setProductData(res.data.product);
        
        // Find primary image or fallback to first
        let primary = res.data.product.primary_image || null;
        if (!primary && res.data.product.images && res.data.product.images.length > 0) {
          primary = res.data.product.images[0].image_url;
        }
        setActiveImage(primary);
      } catch (error) {
        console.error("Erreur de récupération du produit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Reveal animation for related products when they load
  useEffect(() => {
    if (!loading && productData?.related?.length > 0) {
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
  }, [loading, productData]);

  const handleAddToCart = () => {
    addToCart(productData, quantity);
    if (showToast) showToast('Produit ajouté au panier !');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Chargement du produit...</div>;
  if (!productData) return <div style={{ textAlign: 'center', padding: '100px' }}>Produit introuvable.</div>;

  const images = productData.images || [];
  
  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price).replace(/,/g, ' ') + ' CFA';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Accueil</Link> /{' '}
        <Link to={`/shop?category=${productData.category_slug}`} style={{ color: '#666', textDecoration: 'none' }}>{productData.category_name}</Link> /{' '}
        <span style={{ color: '#002855', fontWeight: '500' }}>{productData.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'start' }}>
        
        {/* Left Column - Gallery */}
        <div>
          <div style={{ border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
            {activeImage ? (
              <img src={activeImage} alt={productData.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Aucune image</div>
            )}
          </div>
          
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img.image_url)}
                  style={{ 
                    width: '70px', height: '70px', border: activeImage === img.image_url ? '2px solid #002855' : '1px solid #eaeaea', 
                    borderRadius: '4px', cursor: 'pointer', overflow: 'hidden', padding: '2px'
                  }}
                >
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <h1 style={{ fontSize: '28px', color: '#002855', fontWeight: '600', margin: '0' }}>{productData.name}</h1>
          
          <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '13px' }}>
             {/* Note: This assumes SKU is what we have */}
             <span>Model: {productData.sku || 'N/A'}</span>
             <span>|</span>
             <span>SKU: {productData.sku || 'N/A'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '4px', alignSelf: 'flex-start', fontSize: '12px', fontWeight: 'bold' }}>
             <CheckCircle size={14} /> In Stock
          </div>

          <div style={{ fontSize: '26px', fontWeight: '600', color: '#002855', margin: '10px 0' }}>
            {formatPrice(productData.price)}
            {productData.original_price && (
              <span style={{ fontSize: '16px', color: '#aaa', textDecoration: 'line-through', marginLeft: '12px', fontWeight: '400' }}>
                {formatPrice(productData.original_price)}
              </span>
            )}
          </div>

          <div style={{ borderTop: '1px solid #eaeaea', padding: '20px 0', borderBottom: '1px solid #eaeaea', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
            {/* Quantity Selector */}
            <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', height: '42px' }}>
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '35px', background: '#fff', border: 'none', borderRight: '1px solid #ddd', cursor: 'pointer', fontSize: '16px' }}>-</button>
               <input type="number" readOnly value={quantity} style={{ width: '45px', border: 'none', textAlign: 'center', outline: 'none', fontWeight: '600', color: '#333' }} />
               <button onClick={() => setQuantity(quantity + 1)} style={{ width: '35px', background: '#fff', border: 'none', borderLeft: '1px solid #ddd', cursor: 'pointer', fontSize: '16px' }}>+</button>
            </div>

            <button 
              onClick={handleAddToCart}
              style={{ flex: 1, minWidth: '180px', height: '42px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600',cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0d9f6e'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
            >
               Ajouter au panier
            </button>

            <button style={{ height: '42px', background: 'none', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
               <Heart size={16} /> Add to wishlist
            </button>
            <button style={{ height: '42px', background: 'none', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
               <Activity size={16} /> Compare
            </button>
          </div>

          {/* Bullet points info */}
          <div style={{ border: '1px solid #eaeaea', borderRadius: '4px', padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
            <Truck size={16} color="#666" />
            <strong>2-day Delivery</strong> <span style={{ color: '#ccc' }}>|</span> <span style={{ color: '#666' }}>Speedy and reliable parcel delivery!</span>
          </div>

          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px', padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E' }}>
            <Lock size={16} />
            <strong>Other people want this.</strong> 7 people have this in their carts right now.
          </div>

          <div style={{ fontSize: '13px', color: '#333', marginTop: '10px' }}>
             <strong>Category:</strong> <Link to={`/shop?category=${productData.category_slug}`} style={{ color: '#4F46E5', textDecoration: 'none' }}>{productData.category_name}</Link>
          </div>

          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
            {[{color: '#1877F2', icon: 'fab fa-facebook-f'}, {color: '#1DA1F2', icon: 'fab fa-twitter'}, {color: '#E60023', icon: 'fab fa-pinterest-p'}, {color: '#0A66C2', icon: 'fab fa-linkedin-in'}, {color: '#25D366', icon: 'fab fa-whatsapp'}].map((network, index) => (
               <div key={index} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: network.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <i className={network.icon} style={{ fontSize: '14px' }}></i>
               </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', width: '100%', margin: '10px 0' }} />

          <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
            {productData.description || 'La carte de visite constitue un support incontournable pour laisser une première impression professionnelle et mémorable...'}
          </p>

        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #eaeaea', marginBottom: '20px' }}>
          {['Description', 'Specification', 'Avis (0)'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #002855' : '2px solid transparent',
                padding: '0 0 10px 0', fontSize: '15px', fontWeight: activeTab === tab ? '600' : '500', 
                color: activeTab === tab ? '#002855' : '#888', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
          {activeTab === 'Description' && (
             <div dangerouslySetInnerHTML={{ __html: productData.description ? productData.description.replace(/\n/g, '<br/>') : 'CARTE DE VISITE PAS CHER - IMPRESSION 100% PERSONNALISÉE<br/><br/>Cartes de Visite Recto ou Recto-Verso?' }} />
          )}
          {activeTab === 'Specification' && (
             <p>Les spécifications techniques n'ont pas encore été définies pour ce produit.</p>
          )}
          {activeTab === 'Avis (0)' && (
             <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {productData.related && productData.related.length > 0 && (
        <div style={{ marginTop: '60px' }}>
           <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>Related products</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
             {productData.related.map(rel => (
               <ProductCard 
                key={rel.id} 
                product={{
                  id: rel.id,
                  slug: rel.slug || rel.id,
                  name: rel.name,
                  price: rel.price,
                  originalPrice: rel.original_price,
                  image: rel.primary_image || rel.image_url,
                  badge: rel.badge,
                  category: rel.category_name
                }} 
                onAddToCart={() => {
                   addToCart(rel, 1);
                   if (showToast) showToast('Ajouté au panier ✓');
                }} 
               />
             ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
