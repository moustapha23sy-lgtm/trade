import '../styles/Footer.css'

const categoryLinks = [
  'Objets Publicitaires',
  'Électroménager',
  'Gamme Arganine',
  'Climatiseurs',
  'Téléviseurs',
  'Impression'
]

const accountLinks = [
  'Mon compte',
  'Suivi de commande',
  'Politique de confidentialité',
  'Conditions générales',
  'À propos',
  'Contact'
]

const contactInfo = [
  { icon: 'map-marker-alt', text: 'N°173 Sacré Cœur 3 VDN, Dakar, Sénégal — 11000' },
  { icon: 'phone', text: '(+221) 77 651 03 61\n33 820 85 93' },
  { icon: 'envelope', text: 'tradeinnovation.sn@gmail.com' },
  { icon: 'clock', text: 'Lun – Sam : 08h00 – 18h00' }
]

const socials = [
  { icon: 'facebook-f', href: '#' },
  { icon: 'instagram', href: '#' },
  { icon: 'whatsapp', href: '#' },
  { icon: 'linkedin-in', href: '#' },
  { icon: 'tiktok', href: '#' }
]

const paymentMethods = ['VISA', 'MASTERCARD', 'WAVE', 'OM', 'PAYPAL']

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img 
            src="https://tradeinnovation-sn.com/wp-content/uploads/2025/09/logo-trade-innovation.png"
            alt="Trade Innovation"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div className="footer-brand-name" style={{ marginTop: '.5rem' }}>
            Trade<span>Innovation</span>
          </div>
          <p className="footer-desc">
            Votre partenaire e-commerce à Dakar pour l'impression, l'électroménager et les produits hôteliers. 
            Qualité, rapidité et innovation.
          </p>
          <div className="socials">
            {socials.map((social, index) => (
              <a key={index} href={social.href} className="social-btn">
                <i className={`fab fa-${social.icon}`}></i>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="footer-col-title">Catégories</div>
          <ul className="footer-links">
            {categoryLinks.map((link, index) => (
              <li key={index}>
                <a href="#"><i className="fas fa-chevron-right"></i>{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="footer-col-title">Mon compte</div>
          <ul className="footer-links">
            {accountLinks.map((link, index) => (
              <li key={index}>
                <a href="#"><i className="fas fa-chevron-right"></i>{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="footer-col-title">Nous contacter</div>
          {contactInfo.map((info, index) => (
            <div key={index} className="footer-contact-item">
              <i className={`fas fa-${info.icon}`}></i>
              <span style={{ whiteSpace: 'pre-line' }}>{info.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © 2026 Trade Innovation. Tous droits réservés.
        </span>
        <div className="payment-icons">
          {paymentMethods.map((method, index) => (
            <div key={index} className="payment-icon">{method}</div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
