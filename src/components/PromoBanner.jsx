import { useState, useEffect } from 'react'
import useCountdown from '../hooks/useCountdown'
import api from '../services/api'
import '../styles/PromoBanner.css'

function PromoBanner({ showToast }) {
  const [promo, setPromo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/promo/active')
      .then(res => {
        if (res.data.promo) {
          setPromo(res.data.promo)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Call hook conditionally (it will handle empty/null gracefully)
  const { days, hours, minutes, seconds, isExpired } = useCountdown(promo?.expires_at)

  if (loading || !promo || isExpired) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(promo.code).catch(() => {})
    if (showToast) {
      showToast(`Code ${promo.code} copié ! 🎉`)
    } else {
      alert(`Code ${promo.code} copié ! 🎉`)
    }
  }

  const promoValue = promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString()} FCFA`;

  return (
    <section className="section" style={{ paddingTop: 0, paddingBottom: '3rem' }}>
      <div className="container">
        <div className="promo-banner">
          <div className="promo-decor"></div>
          <div className="promo-decor2"></div>
          <div className="promo-left">
            <div className="promo-tag">🎉 Offre spéciale</div>
            <div className="promo-title">Réduction de {promoValue}</div>
            <div className="promo-sub">Utilisez ce code lors du paiement et profitez d'une réduction immédiate sur votre commande.</div>
            <div className="promo-code-box">
              <div>
                <div className="promo-code-label">Code promo</div>
                <div className="promo-code">{promo.code}</div>
              </div>
              <button className="promo-copy" onClick={copyCode}>
                <i className="fas fa-copy"></i> Copier
              </button>
            </div>
          </div>
          <div className="promo-right">
            {promo.expires_at ? (
              <>
                <p style={{ 
                  color: 'rgba(255,255,255,.5)', 
                  fontSize: '.78rem', 
                  marginBottom: '.8rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '.08em' 
                }}>
                  Offre expire dans
                </p>
                <div className="promo-timer">
                  {parseInt(days, 10) > 0 && (
                    <div className="timer-box">
                      <span className="timer-num">{days}</span>
                      <span className="timer-label">Jours</span>
                    </div>
                  )}
                  <div className="timer-box">
                    <span className="timer-num">{hours}</span>
                    <span className="timer-label">Heures</span>
                  </div>
                  <div className="timer-box">
                    <span className="timer-num">{minutes}</span>
                    <span className="timer-label">Min</span>
                  </div>
                  <div className="timer-box">
                    <span className="timer-num">{seconds}</span>
                    <span className="timer-label">Sec</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ 
                  color: 'rgba(255,255,255,.9)', 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  textTransform: 'uppercase', 
                  letterSpacing: '.1em' 
                }}>
                  Offre valable pour une durée indéterminée
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromoBanner
