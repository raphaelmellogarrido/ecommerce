import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Register() {
  const [formData, setFormData] = useState({ nome: "", email: "", password: "" });
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica do lado do cliente (ex: tamanho da password)
    if (formData.password.length < 6) {
      addToast("A palavra-passe deve ter pelo menos 6 caracteres! ⚠️", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Conta criada com sucesso! Já podes iniciar sessão. 🎉", "success");
        navigate("/login"); // Redireciona para o login após registar
      } else {
        addToast(data.erro || "Erro ao criar a conta. Tenta novamente. ❌", "error");
      }
    } catch (err) {
      console.error("Erro no registo:", err);
      addToast("Erro ao ligar ao servidor. Verifica o teu backend.", "error");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Criar Conta</h2>
        <p className="auth-subtitle">Junta-te à TechStore e faz as tuas compras</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Neves" required />
          </div>

          <div className="form-group">
            <label>Endereço de Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" required />
          </div>

          <div className="form-group">
            <label>Palavra-passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
          </div>

          <button type="submit" className="auth-btn register-variant">
            Criar Minha Conta
          </button>
        </form>

        <p className="auth-footer">
          Já tens conta? <span onClick={() => navigate("/login")}>Entra aqui</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
