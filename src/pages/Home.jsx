import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import ClientsMarquee from '../components/ClientsMarquee'
import Avantages from '../components/Avantages'
import Categories from '../components/Categories'
import ProductsSection from '../components/ProductsSection'
import PromoBanner from '../components/PromoBanner'
import ElectroSection from '../components/ElectroSection'
import Newsletter from '../components/Newsletter'
import { useCart } from '../hooks'
import api from '../services/api'

// Remove hardcoded trendingProducts

const Home = ({ showToast }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = React.useState([]);

  React.useEffect(() => {
    api.get('/homepage-sections/trending')
      .then(res => {
        if (res.data.products) {
          const formatted = res.data.products.map(p => ({
            id: p.id,
            image: p.image_url || 'https://via.placeholder.com/400',
            badge: p.badge,
            category: p.category_name || 'Divers',
            slug: p.slug,
            name: p.name,
            price: Number(p.price) || 0,
            originalPrice: Number(p.original_price) || null
          }));
          setTrendingProducts(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    if (showToast) {
      showToast('Ajouté au panier ✓');
    }
  }

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: .12 })

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, []) // run once on mount since data is static

  return (
    <main>
      <HeroSlider />
      <ClientsMarquee />
      <Avantages />
      <Categories onCategoryClick={handleCategoryClick} />
      <ProductsSection
        title="Produits tendance"
        label="Sélection de la semaine"
        products={trendingProducts}
        onAddToCart={handleAddToCart}
      />
      <PromoBanner showToast={showToast} />
      <ElectroSection 
        onAddToCart={handleAddToCart} 
        showToast={showToast}
      />
      <Newsletter showToast={showToast} />
    </main>
  )
}

export default Home
