import '../styles/Avantages.css'

const avantages = [
  {
    icon: 'globe-africa',
    title: 'Livraison partout au Sénégal',
    desc: 'Livraison rapide et fiable dans toutes les régions du Sénégal.'
  },
  {
    icon: 'rotate-left',
    title: 'Retours sous 15 jours',
    desc: 'Politique de retour étendue pour vous garantir une expérience sans risque.'
  },
  {
    icon: 'lock',
    title: 'Paiement sécurisé',
    desc: 'Vos transactions sont protégées par notre réseau de sécurité privé.'
  }
]

function Avantages() {
  return (
    <div className="avantages">
      <div className="avantages-grid">
        {avantages.map((item, index) => (
          <div key={index} className="avantage-item reveal">
            <div className="avantage-icon">
              <i className={`fas fa-${item.icon}`}></i>
            </div>
            <div>
              <div className="avantage-title">{item.title}</div>
              <div className="avantage-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Avantages
