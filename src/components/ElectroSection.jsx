import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import api from '../services/api'
import '../styles/Categories.css'
import '../styles/ElectroSection.css'

const filters = [
  'Tous',
  'Climatiseurs',
  'Réfrigérateurs',
  'Cuisinières',
  'Téléviseurs',
  'Machines à laver',
  'Micro-ondes',
  'Aspirateurs'
]

function ElectroSection({ onAddToCart, showToast }) {
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [electroProducts, setElectroProducts] = useState([])

  useEffect(() => {
    // Note: use the absolute URL or api service (which already points to backend)
    // api service uses configured base URL, so it's better.
    api.get('/homepage-sections/electro')
      .then(res => {
        if (res.data.products) {
          const formatted = res.data.products.map(p => ({
            id: p.id,
            image: p.image_url || 'https://via.placeholder.com/400',
            badge: p.badge,
            category: p.category_name || 'Divers',
            slug: p.slug || p.id.toString(),
            name: p.description || p.name,
            price: Number(p.price) || 0,
            originalPrice: Number(p.original_price) || null
          }));
          setElectroProducts(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter)
    if (showToast) {
      showToast(`Filtre : ${filter}`)
    }
  }

  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <div className="section-label">Gros & petit électroménager</div>
            <h2 className="section-title">Notre gamme <span>électroménager</span></h2>
          </div>
          <Link to="/category/electromenager" className="view-all">Tout voir <i className="fas fa-arrow-right"></i></Link>
        </div>
        <div className="electro-filters reveal">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="products-grid">
          {electroProducts.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ElectroSection
