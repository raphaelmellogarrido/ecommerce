import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Adicionado Link aqui
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erro ao procurar produtos:", err));
  }, []);

  const handleAddToCartClick = (product) => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      addToast("Precisas de fazer login para adicionar produtos ao carrinho! 🔐", "error");
      navigate("/login");
      return;
    }

    addToCart(product);
    addToast("Produto adicionado ao carrinho! 🛒", "success");
  };

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <Link to={`/product/${product.id}`} className="product-info-link">
            <div className="product-image-container">
              <img src={product.imagem ? `http://localhost:5000${product.imagem}` : "/placeholder.png"} alt={product.nome} />
            </div>
          </Link>

          {/* 🌟 LINK NO BLOCO DE TEXTO E INFO */}
          <Link to={`/product/${product.id}`} className="product-info-link">
            <div className="product-info">
              <h3 className="product-title">{product.nome}</h3>
              {/* <p className="product-description">{product.descricao}</p> */}

              <div className="product-meta">
                <span className="product-price">{parseFloat(product.preco).toFixed(2)}€</span>
                <span className={`product-stock ${product.quantidade > 0 ? "in-stock" : "out-of-stock"}`}>{product.quantidade > 0 ? `Em stock` : "Esgotado"}</span>
              </div>
            </div>
          </Link>

          {/* Botão isolado no fundo do cartão */}
          <button className="add-to-cart-btn" disabled={product.quantidade <= 0} onClick={() => handleAddToCartClick(product)}>
            {product.quantidade > 0 ? "Adicionar ao Carrinho" : "Sem Stock"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;
