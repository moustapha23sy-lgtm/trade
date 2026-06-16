import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Navigation() {
  const navigate = useNavigate();
  const [poles, setPoles] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then(res => setPoles(res.data.categories || []))
      .catch(err => console.error('Erreur chargement menu:', err));
  }, []);

  // Navigate: if item has children → category page, else → shop filter
  const goTo = (e, item) => {
    e.preventDefault();
    const hasKids = parseInt(item.child_count) > 0 || (item.children && item.children.length > 0);
    if (hasKids) {
      navigate(`/category/${item.slug}`);
    } else {
      navigate(`/shop?category=${item.slug}`);
    }
  };

  const goToPole = (e, pole) => {
    e.preventDefault();
    navigate(`/category/${pole.slug}`);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Static: Tout */}
        <div className="nav-item">
          <a href="/shop" className="nav-link nav-all" onClick={e => { e.preventDefault(); navigate('/shop'); }}>
            <i className="fas fa-th"></i> Tout
          </a>
        </div>

        {/* Static: Accueil */}
        <div className="nav-item">
          <a href="/" className={`nav-link ${window.location.pathname === '/' ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); navigate('/'); }}>
            Accueil
          </a>
        </div>

        {/* Dynamic poles */}
        {poles.map(pole => {
          const children = pole.children || [];
          if (children.length === 0) return null;

          // Check if any child has its own children (3-level hierarchy)
          const hasDeepChildren = children.some(
            c => parseInt(c.child_count) > 0 || (c.children && c.children.length > 0)
          );

          return (
            <div key={pole.id} className={`nav-item ${hasDeepChildren ? 'nav-item-mega' : ''}`}>
              <a
                href={`/category/${pole.slug}`}
                className="nav-link"
                onClick={e => goToPole(e, pole)}
              >
                {pole.name}
                <i className="fas fa-chevron-down"></i>
              </a>

              {/* Dropdown Menu (supports up to 3 levels) */}
              <div className="dropdown">
                {children.map(cat => {
                  const subChildren = cat.children || [];
                  const hasSubKids = subChildren.length > 0;

                  return (
                    <div key={cat.id} className={`dropdown-item ${hasSubKids ? 'has-submenu' : ''}`}>
                      <a href={`/category/${cat.slug}`} onClick={e => goTo(e, cat)}>
                        {cat.name}
                        {hasSubKids && <i className="fas fa-chevron-right submenu-icon"></i>}
                      </a>

                      {/* Level 3: Submenu */}
                      {hasSubKids && (
                        <div className="submenu">
                          {subChildren.map(sub => (
                            <a key={sub.id} href={`/shop?category=${sub.slug}`} onClick={e => goTo(e, sub)}>
                              {sub.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Static: Shop, Contact */}
        <div className="nav-item">
          <a href="/shop" className="nav-link" onClick={e => { e.preventDefault(); navigate('/shop'); }}>
            Shop
          </a>
        </div>
        <div className="nav-item">
          <a href="/contact" className="nav-link" onClick={e => { e.preventDefault(); navigate('/contact'); }}>
            Contact
          </a>
        </div>

      </div>
    </nav>
  );
}

export default Navigation;
