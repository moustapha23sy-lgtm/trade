import React from 'react';
import { useCart } from '../hooks';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '28px', color: '#002855', marginBottom: '30px' }}>Votre Panier</h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Votre panier est actuellement vide.</p>
          <button 
            onClick={() => navigate('/shop')} 
            style={{ padding: '12px 24px', backgroundColor: '#002855', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Retour à la boutique
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
          
          <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px', fontSize: '14px', color: '#666' }}>Produit</th>
                  <th style={{ padding: '10px', fontSize: '14px', color: '#666' }}>Prix</th>
                  <th style={{ padding: '10px', fontSize: '14px', color: '#666' }}>Quantité</th>
                  <th style={{ padding: '10px', fontSize: '14px', color: '#666', textAlign: 'right' }}>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => {
                  const product = item.product || {};
                  const price = typeof product.price === 'number' ? product.price : (item.unit_price || 0);
                  return (
                    <tr key={item.product_id || idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '15px 10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                        {(product.image || product.image_url) ? (
                          <img src={product.image || product.image_url} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div>
                        )}
                        <span style={{ fontWeight: '500', color: '#333' }}>{product.name}</span>
                      </td>
                      <td style={{ padding: '15px 10px', color: '#333' }}>{price.toLocaleString()} FCFA</td>
                      <td style={{ padding: '15px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', width: 'fit-content' }}>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                          <span style={{ padding: '0 10px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                        </div>
                      </td>
                      <td style={{ padding: '15px 10px', textAlign: 'right', fontWeight: 'bold', color: '#002855' }}>
                        {(price * item.quantity).toLocaleString()} FCFA
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '25px', border: '1px solid #eee', borderRadius: '8px', position: 'sticky', top: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Total panier</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
              <span>Sous-total</span>
              <span>{cartTotal.toLocaleString()} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '18px', fontWeight: 'bold', color: '#002855' }}>
              <span>Total</span>
              <span>{cartTotal.toLocaleString()} FCFA</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '15px', backgroundColor: '#e21836', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}>
              Valider la commande
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
