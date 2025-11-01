import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SessionProvider } from './context/SessionContext';

// Pages
import Home from './pages/Home';
import TableSession from './pages/TableSession';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import WaiterPanel from './pages/WaiterPanel';
import KitchenDisplay from './pages/KitchenDisplay';
import AdminQR from './pages/AdminQR';

function App() {
  return (
    <Router>
      <SessionProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/table/:tableNumber" element={<TableSession />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/waiter" element={<WaiterPanel />} />
            <Route path="/kitchen" element={<KitchenDisplay />} />
            <Route path="/admin/qr" element={<AdminQR />} />
          </Routes>
        </CartProvider>
      </SessionProvider>
    </Router>
  );
}

export default App;

