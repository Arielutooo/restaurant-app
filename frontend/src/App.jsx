import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider } from './context/AuthContext';

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

// Owner Pages
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerMenu from './pages/owner/OwnerMenu';
import OwnerAnalytics from './pages/owner/OwnerAnalytics';

function App() {
  return (
    <Router>
      <AuthProvider>
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
              
              {/* Owner Routes */}
              <Route path="/owner/login" element={<OwnerLogin />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/menu" element={<OwnerMenu />} />
              <Route path="/owner/analytics" element={<OwnerAnalytics />} />
            </Routes>
          </CartProvider>
        </SessionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

