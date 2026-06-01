import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider, CartProvider } from './context'
import { useCart } from './hooks'
import Topbar from './components/Topbar'
import Header from './components/Header'
import Navigation from './components/Navigation'
import MobileNav from './components/MobileNav'
import Footer from './components/Footer'
import Toast from './components/Toast'

// Pages
import Home from './pages/Home'
import Account from './pages/Account'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import CategoryLanding from './pages/CategoryLanding'
import Contact from './pages/Contact'

import './styles/App.css'

function AppContent() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const showToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  return (
    <div className="app">
      <Topbar />
      <Header
        onMenuToggle={() => setMobileNavOpen(true)}
        cartCount={cartCount}
        onCartClick={() => navigate('/cart')}
      />
      <Navigation />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <Routes>
        <Route path="/" element={<Home showToast={showToast} />} />
        <Route path="/shop" element={<Shop showToast={showToast} />} />
        <Route path="/category/:slug" element={<CategoryLanding />} />
        <Route path="/product/:slug" element={<ProductDetail showToast={showToast} />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact showToast={showToast} />} />
      </Routes>

      <Footer />
      <Toast show={toast.show} message={toast.message} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
