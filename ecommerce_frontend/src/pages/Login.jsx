import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Guardar os dados no localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);

        // 2. Notificação de sucesso
        addToast(`Bem-vindo de volta, ${data.user.nome}! 👋🔥`, "success");

        // 3. Redirecionamento inteligente baseado no cargo (role)
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }

        // 4. Forçar o reload para atualizar o estado da Navbar/Carrinho
        window.location.reload();
      } else {
        // Mensagem de erro vinda do backend
        addToast(data.erro || "Dados de login incorretos. ❌", "error");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      addToast("Erro ao ligar ao servidor. Verifica a tua ligação.", "error");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Entrar na TechStore</h2>
        <p className="auth-subtitle">Insere os teus dados para aceder à tua conta</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Endereço de Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" required />
          </div>

          <div className="form-group">
            <label>Palavra-passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn">
            Iniciar Sessão
          </button>
        </form>

        <p className="auth-footer">
          Não tens uma conta? <span onClick={() => navigate("/register")}>Regista-te aqui</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
