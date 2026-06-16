import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function MobileNav({ isOpen, onClose }) {
  const [expandedPole, setExpandedPole]   = useState(null)
  const [expandedCat,  setExpandedCat]    = useState(null)
  const [poles, setPoles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories')
      .then(res => setPoles(res.data.categories || []))
      .catch(err => console.error('Erreur chargement menu mobile:', err))
  }, [])

  const go = (path) => { onClose(); navigate(path) }

  const goToItem = (item) => {
    const hasKids = parseInt(item.child_count) > 0 || (item.children && item.children.length > 0)
    if (hasKids) {
      go(`/category/${item.slug}`)
    } else {
      go(`/shop?category=${item.slug}`)
    }
  }

  return (
    <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
      <div className="nav-backdrop" onClick={onClose}></div>
      <div className="nav-drawer">

        {/* Header */}
        <div className="drawer-head">
          <div className="logo-fallback">
            Trade<span style={{ color: 'var(--orange)' }}>Innovation</span>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Accueil */}
        <a href="/" className="drawer-link" onClick={e => { e.preventDefault(); go('/') }}>
          Accueil <i className="fas fa-chevron-right"></i>
        </a>

        {/* Pôles dynamiques */}
        {poles.map((pole, poleIdx) => {
          const children = pole.children || []
          const hasChildren = children.length > 0
          const isPoleOpen = expandedPole === poleIdx

          return (
            <div key={pole.id}>
              {/* Niveau 1 : Pôle */}
              <a
                href="#"
                className="drawer-link"
                onClick={e => {
                  e.preventDefault()
                  if (hasChildren) {
                    setExpandedPole(isPoleOpen ? null : poleIdx)
                    setExpandedCat(null)
                  } else {
                    go(`/category/${pole.slug}`)
                  }
                }}
              >
                {pole.name}
                {hasChildren
                  ? <i className={`fas fa-chevron-${isPoleOpen ? 'down' : 'right'}`}></i>
                  : <i className="fas fa-chevron-right"></i>
                }
              </a>

              {/* Niveau 2 : Catégories */}
              {hasChildren && isPoleOpen && (
                <div className="drawer-sub-menu">
                  {children.map((cat, catIdx) => {
                    const subChildren = cat.children || []
                    const hasSubKids = subChildren.length > 0 || parseInt(cat.child_count) > 0
                    const isCatOpen  = expandedCat === `${poleIdx}-${catIdx}`

                    return (
                      <div key={cat.id}>
                        {/* Niveau 2 item */}
                        <a
                          href="#"
                          className="drawer-sub-link drawer-group-link"
                          onClick={e => {
                            e.preventDefault()
                            if (hasSubKids) {
                              setExpandedCat(isCatOpen ? null : `${poleIdx}-${catIdx}`)
                            } else {
                              onClose()
                              goToItem(cat)
                            }
                          }}
                        >
                          {cat.name}
                          {hasSubKids && (
                            <i className={`fas fa-chevron-${isCatOpen ? 'down' : 'right'}`}></i>
                          )}
                        </a>

                        {/* Niveau 3 : Sous-catégories */}
                        {hasSubKids && isCatOpen && (
                          <div className="drawer-leaf-menu">
                            {subChildren.map(sub => (
                              <a
                                key={sub.id}
                                href="#"
                                className="drawer-leaf-link"
                                onClick={e => { e.preventDefault(); onClose(); goToItem(sub) }}
                              >
                                {sub.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Shop, Contact, Compte */}
        <a href="/shop"    className="drawer-link" onClick={e => { e.preventDefault(); go('/shop') }}>
          Shop <i className="fas fa-chevron-right"></i>
        </a>
        <a href="/contact" className="drawer-link" onClick={e => { e.preventDefault(); go('/contact') }}>
          Contact <i className="fas fa-chevron-right"></i>
        </a>
        <a href="/account" className="drawer-link" onClick={e => { e.preventDefault(); go('/account') }}>
          Mon Compte <i className="fas fa-chevron-right"></i>
        </a>

        {/* Contact info */}
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
