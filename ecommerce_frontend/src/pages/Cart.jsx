import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="app-container cart-empty-container">
        <h2>O teu carrinho está vazio! 🏪</h2>
        <p>
          Volta à{" "}
          <Link to="/" className="cart-empty-link">
            Loja
          </Link>{" "}
          para escolheres os teus periféricos.
        </p>
      </div>
    );
  }

  const totalPrice = cart.reduce((total, item) => total + item.preco * item.cartQuantity, 0);

  const handleCheckout = async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      alert("Precisas de estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(userString);

    try {
      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cart: cart,
          total: totalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Sucesso! Encomenda #${data.orderId} registada. O stock foi atualizado! 🛒🎉`);
        clearCart();
        navigate("/");
      } else {
        alert(`Erro no checkout: ${data.erro}`);
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  return (
    <div className="app-container">
      <h1>O Teu Carrinho</h1>

      <div className="cart-page-container">
        {/* LISTAGEM DE ITENS DO CARRINHO */}
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row">
              {/* LINK NA IMAGEM DO CARRINHO */}
              <Link to={`/product/${item.id}`} className="product-info-link">
                <img src={item.imagem ? `http://localhost:5000${item.imagem}` : "/placeholder.png"} alt={item.nome} className="cart-item-img" />
              </Link>

              {/* LINK NAS INFORMAÇÕES (NOME) DO PRODUTO */}
              <Link to={`/product/${item.id}`} className="product-info-link cart-item-info-wrapper">
                <div>
                  <h3 className="cart-item-title">{item.nome}</h3>
                  <span className="cart-item-price-unit">{parseFloat(item.preco).toFixed(2)}€ / un</span>
                </div>
              </Link>

              {/* Controlos de Quantidade */}
              <div className="cart-item-qty-controls">
                <button className="qty-btn" onClick={() => decreaseQuantity(item.id)}>
                  -
                </button>
                <span className="qty-number">{item.cartQuantity}</span>
                <button className="qty-btn" onClick={() => addToCart(item)} disabled={item.cartQuantity >= item.quantidade}>
                  +
                </button>
              </div>

              {/* Subtotal do Item */}
              <div className="cart-item-subtotal">{(item.preco * item.cartQuantity).toFixed(2)}€</div>

              {/* Botão de Remover Item Integralmente */}
              <button className="delete-item-btn" onClick={() => removeFromCart(item.id)} title="Remover produto">
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* CARD DE RESUMO DO PEDIDO */}
        <div className="cart-summary-box">
          <h3 className="summary-title">Resumo do Pedido</h3>
          <hr className="summary-divider" />

          <p className="summary-row">
            <span>Artigos:</span>
            <strong>{cart.reduce((acc, item) => acc + item.cartQuantity, 0)} unidades</strong>
          </p>

          <p className="total-amount summary-total-row">
            <span>Total:</span>
            <span>{totalPrice.toFixed(2)}€</span>
          </p>

          <button className="checkout-btn" onClick={handleCheckout}>
            Finalizar Compra Real 💳
          </button>

          <button className="clear-cart-btn" onClick={clearCart}>
            Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
