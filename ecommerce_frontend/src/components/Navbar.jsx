import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🚀 TechStore</Link>
      </div>

      <div className="navbar-links">
        {user && <Link to="/my-orders">Minhas Encomendas</Link>}

        <Link to="/cart" className="cart-link-wrapper">
          <span className="cart-icon-nav">🛒</span>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>

        {user && user.role === "admin" && (
          <Link to="/admin" className="admin-link">
            Painel Admin
          </Link>
        )}

        {user ? (
          <div className="user-nav-box">
            <span className="user-welcome">
              Olá, <strong>{user.nome}</strong>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </div>
        ) : (
          <div className="auth-nav-buttons">
            <Link to="/login" className="login-link">
              Entrar
            </Link>
            <Link to="/register" className="register-btn">
              Criar Conta
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
