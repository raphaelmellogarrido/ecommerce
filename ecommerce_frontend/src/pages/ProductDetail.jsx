import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        addToast("Erro ao carregar o produto.", "error");
        navigate("/");
      });
  }, [id, navigate, addToast]);

  const handleAddToCartClick = () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      addToast("Precisas de fazer login para adicionar produtos! 🔐", "error");
      navigate("/login");
      return;
    }
    addToCart(product);
    addToast(`${product.nome} adicionado ao carrinho! 🛒`, "success");
  };

  if (loading)
    return (
      <div className="loading-state">
        <h3>A carregar... ⏳</h3>
      </div>
    );

  return (
    <div className="product-detail-page">
      <button className="back-btn-round" onClick={() => navigate("/")}>
        ←
      </button>

      <div className="detail-card">
        {/* LADO ESQUERDO */}
        <div className="detail-image-box">
          <h1 className="detail-title-top">{product.nome}</h1>
          <img src={`http://localhost:5000${product.imagem}`} alt={product.nome} />
        </div>

        {/* LADO DIREITO */}
        <div className="detail-info" style={{ minWidth: "300px", flex: "1" }}>
          <div className="detail-price">{parseFloat(product.preco).toFixed(2)}€</div>

          <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
            Adicionar ao Carrinho 🛒
          </button>

          <div className="detail-description-box">
            <h3>Descrição do Produto</h3>
            <p>{product.descricao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
