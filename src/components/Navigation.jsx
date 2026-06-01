import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Navigation() {
  const navigate = useNavigate();
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then(res => setDbCategories(res.data.categories || []))
      .catch(err => console.error("Erreur chargement menu:", err));
  }, []);

  const toSlug = (label) => label.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleNavClick = (e, path, categoryLabel, isParent = false) => {
    e.preventDefault();
    if (categoryLabel) {
      const slug = toSlug(categoryLabel);
      if (isParent) {
        navigate(`/category/${slug}`);
      } else {
        navigate(`/shop?category=${slug}`);
      }
    } else if (path) {
      navigate(path);
    }
  };

  const baseNavItems = [
    { label: 'Tout', icon: 'th', isAll: true, path: '/shop' },
    { label: 'Accueil', isActive: window.location.pathname === '/', path: '/' }
  ];

  const dynamicItems = dbCategories.map(pole => {
    const childrenNames = pole.children ? pole.children.map(c => c.name) : [];
    const isMega = childrenNames.length >= 8; // Automatically becomes a horizontal mega menu if >= 8 items
    
    let megaColumns = [];
    if (isMega) {
      const perColumn = Math.ceil(childrenNames.length / 3);
      for (let i = 0; i < childrenNames.length; i += perColumn) {
        megaColumns.push({ 
          heading: `Catégories (${i/perColumn + 1})`, 
          items: childrenNames.slice(i, i + perColumn) 
        });
      }
    }

    return {
      label: pole.name,
      hasDropdown: childrenNames.length > 0,
      isMega: isMega,
      dropdownItems: childrenNames,
      megaColumns: megaColumns
    };
  });

  const endNavItems = [
    { label: 'Shop', path: '/shop' },
    { label: 'Contact', path: '/contact' }
  ];

  const navItems = [...baseNavItems, ...dynamicItems, ...endNavItems];

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

