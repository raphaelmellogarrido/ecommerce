import { Navigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function ProtectedRoute({ children }) {
  const { addToast } = useToast();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 1. Verifica se o utilizador está logado
  if (!user) {
    addToast("Precisas de iniciar sessão para aceder a esta área.", "error");
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica se o utilizador é administrador (ajusta conforme a tua lógica de BD)
  // Assumindo que tens um campo 'role' ou 'isAdmin' no teu objeto user
  if (user.role !== "admin") {
    addToast("Acesso negado: Apenas administradores.", "error");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
