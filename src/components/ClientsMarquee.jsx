import '../styles/ClientsMarquee.css'

const clients = [
  { name: 'UNFPA', icon: 'globe' },
  { name: 'LUX-DEV', icon: 'handshake' },
  { name: 'PAPEV', icon: 'leaf' },
  { name: 'ONU FEMME', icon: 'venus' },
  { name: 'NATIONS UNIES', icon: 'university' },
  { name: 'INFINITY POWER', icon: 'bolt' },
  { name: 'MAKKIYON TRAVEL', icon: 'plane' },
  { name: 'SALOUM PHARMA', icon: 'pills' },
  { name: "HÔTEL GOOD RADE", icon: 'hotel' }
]

function ClientsMarquee() {
  return (
    <div className="clients">
      <div className="marquee-wrap">
        {[...clients, ...clients].map((client, index) => (
          <div key={index} className="client-logo">
            <i className={`fas fa-${client.icon}`}></i>
            {client.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientsMarquee
