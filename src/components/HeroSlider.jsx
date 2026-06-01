import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import '../styles/HeroSlider.css'

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch slides from backend
    api.get('/slides')
      .then(res => {
        if (res.data.slides && res.data.slides.length > 0) {
          setSlides(res.data.slides)
        } else {
          // Fallback if no active slides found in DB
          setSlides([
            {
              id: 1,
              tag: 'Bienvenue',
              title: 'Découvrez notre',
              title_highlight: 'Collection',
              subtitle: 'Parcourez nos offres exceptionnelles.',
              cta_text: 'Explorer',
              cta_link: '/shop',
              image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80'
            }
          ])
        }
      })
      .catch(err => {
        console.error("Erreur de récupération des slides:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index)
  }, [])

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }, [slides.length])

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(nextSlide, 5000)
      return () => clearInterval(interval)
    }
  }, [nextSlide, slides.length])

  if (loading) {
    return <section className="hero"><div className="slide" style={{backgroundColor: '#f3f4f6'}}></div></section>
  }

  if (slides.length === 0) return null;

  return (
    <section className="hero">
      <div 
        className="slides-track" 
        style={{ transform: `translateX(-${currentSlide * (100 / slides.length)}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ width: `${100 / slides.length}%` }}
          >
            <div 
              className="slide-bg" 
              style={{ backgroundImage: `url('${slide.image_url || slide.image}')` }}
            ></div>
            <div className="slide-overlay"></div>
            <div className="slide-content">
              {slide.tag && <span className="slide-tag">{slide.tag}</span>}
              <h1 className="slide-title">
                {slide.title}<br />
                {slide.title_highlight && <span>{slide.title_highlight}</span>}
              </h1>
              {slide.subtitle && <p className="slide-sub">{slide.subtitle}</p>}
              <a href={slide.cta_link || '#'} className="slide-cta">
                {slide.cta_text || slide.cta} <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="hero-arrow hero-next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="hero-nav">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default HeroSlider
