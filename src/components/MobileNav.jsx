import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MobileNav({ isOpen, onClose }) {
  const [expandedItem, setExpandedItem] = useState(null)
  const navigate = useNavigate()

  const handleNavClick = (e, path, categoryLabel) => {
    e.preventDefault();
    onClose();
    if (categoryLabel) {
      const slug = categoryLabel.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      navigate(`/shop?category=${slug}`);
    } else if (path) {
      navigate(path);
    }
  };

  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Objets Publicitaires', subItems: [
        'Cartes de visite',
        'Flyers / Tracts',
        'Affiches publicitaires',
        'Plaquettes / Dépliants',
        'Calendriers',
        'Broderie'
      ]
    },
    { label: 'Électroménager', subItems: [
        'Climatiseurs',
        'Réfrigérateurs',
        'Cuisinières',
        'Congélateurs',
        'Machines à laver',
        'Téléviseurs',
        'Micro-ondes',
        'Petit électroménager'
      ]
    },
    { label: 'Hôtellerie', subItems: [
        'Gel',
        'Gel Cheveux',
        'Lotion',
        'Savon Plissé',
        'Shampooing & Conditionneur',
        'Gamme Arganine',
        'Linge hôtelier',
        'Produit d\'accueil',
        'Mobilier et accessoires',
        'Communication et branding',
        'Équipement de chambre',
        'Signalétique et article personnalisé',
        'Textiles personnalisés',
        'Objet publicitaire et packaging',
        'Impression corporate & cadeaux institutionnels'
      ]
    },
    { label: 'Shop', path: '/shop' },
    { label: 'Contact', path: '/contact' },
    { label: 'Mon Compte', path: '/account' }
  ]

  const toggleExpand = (index) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  return (
    <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
      <div className="nav-backdrop" onClick={onClose}></div>
      <div className="nav-drawer">
        <div className="drawer-head">
          <div className="logo-fallback">
            Trade<span style={{ color: 'var(--orange)' }}>Innovation</span>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {navItems.map((item, index) => (
          <div key={index}>
            <a 
              href={item.path || '#'}
              className="drawer-link" 
              onClick={(e) => {
                if (item.subItems) {
                  e.preventDefault()
                  toggleExpand(index)
                } else {
                  handleNavClick(e, item.path)
                }
              }}
            >
              {item.label} 
              {item.subItems ? (
                <i className={`fas fa-chevron-${expandedItem === index ? 'down' : 'right'}`}></i>
              ) : (
                <i className="fas fa-chevron-right"></i>
              )}
            </a>
            {item.subItems && expandedItem === index && (
              <div className="drawer-sub-menu">
                {item.subItems.map((sub, subIndex) => (
                  <a key={subIndex} href="#" className="drawer-sub-link" onClick={(e) => handleNavClick(e, null, sub)}>
                    {sub}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-mid)' }}>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.8rem' }}>Contact</p>
          <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--navy)' }}>
            <i className="fas fa-phone" style={{ color: 'var(--orange)', marginRight: '.4rem' }}></i>
            (+221) 77 651 03 61
          </p>
          <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--navy)', marginTop: '.5rem' }}>
            <i className="fas fa-envelope" style={{ color: 'var(--orange)', marginRight: '.4rem' }}></i>
            tradeinnovation.sn@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileNav
