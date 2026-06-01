import { useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const toSlug = (label) => label.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleNavClick = (e, path, categoryLabel, isParent = false) => {
    e.preventDefault();
    if (categoryLabel) {
      const slug = toSlug(categoryLabel);
      // Parent poles go to the category landing page
      if (isParent) {
        navigate(`/category/${slug}`);
      } else {
        // Sub-categories go to filtered shop
        navigate(`/shop?category=${slug}`);
      }
    } else if (path) {
      navigate(path);
    }
  };
  const navItems = [
    { label: 'Tout', icon: 'th', isAll: true, path: '/shop' },
    { label: 'Accueil', isActive: true, path: '/' },
    { 
      label: 'Objets Publicitaires', 
      hasDropdown: true,
      dropdownItems: [
        'Cartes de visite',
        'Flyers / Tracts',
        'Affiches publicitaires',
        'Plaquettes / Dépliants',
        'Calendriers',
        'Broderie'
      ]
    },
    { 
      label: 'Électroménager', 
      hasDropdown: true,
      dropdownItems: [
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
    { 
      label: 'Hôtellerie', 
      hasDropdown: true,
      isMega: true,
      megaColumns: [
        {
          heading: 'Produits d\'accueil',
          items: [
            'Gel',
            'Gel Cheveux',
            'Lotion',
            'Savon Plissé',
            'Shampooing & Conditionneur',
            'Gamme Arganine'
          ]
        },
        {
          heading: 'Services & Équipements',
          items: [
            'Linge hôtelier',
            'Produit d\'accueil',
            'Mobilier et accessoires',
            'Équipement de chambre',
            'Textiles personnalisés'
          ]
        },
        {
          heading: 'Communication',
          items: [
            'Communication et branding',
            'Signalétique et article personnalisé',
            'Objet publicitaire et packaging',
            'Impression corporate & cadeaux institutionnels'
          ]
        }
      ]
    },
    { label: 'Shop', path: '/shop' },
    { label: 'Contact', path: '/contact' }
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        {navItems.map((item, index) => (
          <div key={index} className={`nav-item ${item.isMega ? 'nav-item-mega' : ''}`}>
            <a 
              href={item.path || '#'}
              onClick={(e) => {
                if (item.hasDropdown) {
                  // Navigate to category landing page on parent click
                  handleNavClick(e, null, item.label, true);
                } else {
                  handleNavClick(e, item.path);
                }
              }}
              className={`nav-link ${item.isAll ? 'nav-all' : ''} ${item.isActive ? 'active' : ''}`}
            >
              {item.icon && <i className={`fas fa-${item.icon}`}></i>}
              {item.label}
              {item.hasDropdown && <i className="fas fa-chevron-down"></i>}
            </a>
            {item.hasDropdown && !item.isMega && (
              <div className="dropdown">
                {item.dropdownItems.map((subItem, subIndex) => (
                  <a key={subIndex} href="#" onClick={(e) => handleNavClick(e, null, subItem, false)}>{subItem}</a>
                ))}
              </div>
            )}
            {item.isMega && (
              <div className="mega-dropdown">
                {item.megaColumns.map((col, colIndex) => (
                  <div key={colIndex} className="mega-col">
                    <div className="mega-col-heading">{col.heading}</div>
                    {col.items.map((subItem, subIndex) => (
                      <a key={subIndex} href="#" onClick={(e) => handleNavClick(e, null, subItem)}>{subItem}</a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

export default Navigation

