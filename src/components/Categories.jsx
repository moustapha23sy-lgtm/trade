import '../styles/Categories.css'

const categories = [
  {
    title: 'Objets Publicitaires',
    slug: 'objets-publicitaires',
    desc: 'Cartes, flyers, affiches, calendriers, broderie — votre identité visuelle.',
    icon: 'print',
    image: '/img.png'
  },
  {
    title: 'Électroménager',
    slug: 'electromenager',
    desc: 'Climatiseurs, réfrigérateurs, téléviseurs, machines à laver et bien plus.',
    icon: 'blender',
    image: '/1.jpeg'
  },
  {
    title: 'Fournitures et Équipement Hôtelier',
    slug: 'fournitures-equipement-hotelier',
    desc: 'Équipements de chambre, linge hôtelier, salle de bain et produits d\'accueil.',
    icon: 'hotel',
    image: '/2.jpg'
  }
]

function Categories({ onCategoryClick }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <div className="section-label">Nos univers</div>
            <h2 className="section-title">Trois pôles,<br /><span>une seule adresse</span></h2>
          </div>
        </div>
        <div className="cat-grid">
          {categories.map((cat, index) => (
            <div 
              key={index} 
              className="cat-card reveal" 
              onClick={() => onCategoryClick(cat.slug)}
            >
              <div 
                className="cat-card-bg" 
                style={{ backgroundImage: `url('${cat.image}')` }}
              ></div>
              <div className="cat-card-overlay"></div>
              <div className="cat-card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="cat-card-body">
                <div className="cat-icon">
                  <i className={`fas fa-${cat.icon}`}></i>
                </div>
                <div className="cat-card-title">{cat.title}</div>
                <div className="cat-card-desc">{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories
