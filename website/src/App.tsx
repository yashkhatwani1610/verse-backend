import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Products from './pages/Products';
import VirtualTryOn from './pages/VirtualTryOn';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/virtual-try-on" element={<VirtualTryOn />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
