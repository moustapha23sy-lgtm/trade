import { Link } from 'react-router-dom';
import '../styles/ProductCard.css'

function ProductCard({ product, onAddToCart }) {
  const price = typeof product.price === 'number' 
    ? product.price.toLocaleString('fr-FR') + ' FCFA'
    : product.price;
  const originalPrice = typeof product.originalPrice === 'number'
    ? product.originalPrice.toLocaleString('fr-FR') + ' FCFA'
    : product.originalPrice;
  const imgSrc = product.image || product.image_url;

  return (
    <div className="product-card">
      <div className="product-img">
        {product.badge && (
          <div className="product-badge">
            {product.badge}
          </div>
        )}
        <Link to={`/product/${product.slug || product.id}`} style={{ display: 'block', height: '100%' }}>
          <img src={imgSrc} alt={product.name} />
        </Link>
        <div className="product-wishlist">
          <i className="fas fa-heart"></i>
        </div>
      </div>
      <div className="product-body">
        <div className="product-cat">{product.category}</div>
        <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="product-name">{product.name}</div>
        </Link>
        <div className="product-price">
          {originalPrice && <span>{originalPrice}</span>}
          {price}
        </div>
        <button className="btn-cart" onClick={onAddToCart}>
          <i className="fas fa-shopping-bag"></i> Ajouter au panier
        </button>
      </div>
    </div>
  )
}

export default ProductCard
