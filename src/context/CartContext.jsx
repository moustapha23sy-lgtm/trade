import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Load from local storage for guests, or just keep empty
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error("Erreur panier:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await api.post('/cart', { product_id: product.id, quantity });
        fetchCart(); // Refresh cart
      } catch (error) {
        console.error("Erreur d'ajout au panier:", error);
      }
    } else {
      // Guest cart logic — store only serializable fields
      const safeProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.image_url || product.primary_image || null,
        image_url: product.image || product.image_url || product.primary_image || null,
        slug: product.slug || null,
      };
      const existing = cart.find(item => item.product_id === product.id);
      let newCart;
      if (existing) {
        newCart = cart.map(item =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...cart, { product_id: product.id, quantity, product: safeProduct }];
      }
      setCart(newCart);
      try {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } catch (e) {
        console.error('Cart serialize error:', e);
      }
    }
  };

  const removeFromCart = async (id) => {
    if (user) {
      try {
        await api.delete(`/cart/${id}`);
        fetchCart();
      } catch (error) {
        console.error("Erreur de suppression du panier:", error);
      }
    } else {
      const newCart = cart.filter(item => item.product_id !== id);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    
    if (user) {
      try {
        await api.put(`/cart/${id}`, { quantity });
        fetchCart();
      } catch (error) {
        console.error("Erreur mise à jour panier:", error);
      }
    } else {
      const newCart = cart.map(item => 
        item.product_id === id ? { ...item, quantity } : item
      );
      setCart(newCart);
      try {
        localStorage.setItem('cart', JSON.stringify(newCart));
      } catch (e) {
        console.error('Cart serialize error:', e);
      }
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        // Delete all cart items for the user
        for (const item of cart) {
          await api.delete(`/cart/${item.id || item.product_id}`);
        }
        setCart([]);
      } catch (error) {
        console.error('Erreur vidage panier:', error);
        setCart([]);
      }
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.product?.price || item.unit_price || 0;
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
