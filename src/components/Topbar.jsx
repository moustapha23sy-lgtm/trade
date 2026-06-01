import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Topbar() {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    api.get('/promo/active')
      .then(res => {
        if (res.data.promo) {
          setPromo(res.data.promo);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <span><i className="fas fa-phone"></i>(+221) 77 651 03 61</span>
          <span><i className="fas fa-envelope"></i>tradeinnovation.sn@gmail.com</span>
          <span><i className="fas fa-map-marker-alt"></i>Sacré Cœur 3 VDN, Dakar</span>
        </div>
        <div className="topbar-right">
          {promo && (
            <span className="promo-pill">CODE PROMO : {promo.code}</span>
          )}
          <a href="#"><i className="fas fa-truck"></i>Livraison partout au Sénégal</a>
          <a href="#"><i className="fas fa-rotate-left"></i>Retours 15j</a>
        </div>
      </div>
    </div>
  )
}

export default Topbar
