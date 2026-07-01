import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail"; // 1. Importar a página de detalhes
import MyOrders from "./pages/MyOrders";
import { ToastProvider } from "./context/ToastContext";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <div className="app-wrapper">
            {" "}
            {/* Este wrapper controla a altura */}
            <Navbar />
            <main className="content">
              {" "}
              {/* O conteúdo expande-se */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/my-orders" element={<MyOrders />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
