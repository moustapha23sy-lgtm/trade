import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import PromoCodes from './pages/PromoCodes';
import HeroSlides from './pages/HeroSlides';
import ProductEdit from './pages/ProductEdit';
import Settings from './pages/Settings';
import HomepageSections from './pages/HomepageSections';
// Placeholders for other pages


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEdit />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="promos" element={<PromoCodes />} />
            <Route path="slides" element={<HeroSlides />} />
            <Route path="homepage-sections" element={<HomepageSections />} />
            <Route path="settings" element={<Settings />} />
            {/* Add more routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
